'use client';

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { fetchEditPost } from './editPost.query';
import { updatePost } from './updatePost.mutation';
import { fetchMe } from '../../../../me/_components/me.query';
import { issuePostImageUploadUrlForEdit } from './issuePostImageUploadUrl.mutation';
import {
  canAddMoreImages,
  extractGraphQLErrorCode,
  isAuthenticationErrorCode,
  isAuthorizationErrorCode,
  validateImageFile,
  validatePostDraft,
} from '@/lib/posts/post-form';

interface EditFormValues {
  content: string;
  subcontent: string;
}

type LoadErrorKind = 'network' | 'not_found' | null;

interface UseEditPostFormResult {
  values: EditFormValues;
  imageUrls: string[];
  loading: boolean;
  pending: boolean;
  uploading: boolean;
  loadError: string | null;
  loadErrorKind: LoadErrorKind;
  submitError: string | null;
  uploadError: string | null;
  loginRequired: boolean;
  onChange: (field: keyof EditFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  retryLoad: () => Promise<void>;
  removeImage: (index: number) => void;
  handleFileChange: (event: FormEvent<HTMLInputElement>) => Promise<void>;
  retryUpload: () => Promise<void>;
}

export function useEditPostForm(postId: string): UseEditPostFormResult {
  const router = useRouter();
  const [values, setValues] = useState<EditFormValues>({
    content: '',
    subcontent: '',
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorKind, setLoadErrorKind] = useState<LoadErrorKind>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loginRequired, setLoginRequired] = useState(false);
  const [retryTargetFile, setRetryTargetFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setLoadErrorKind(null);

    try {
      const [postResponse, meResponse] = await Promise.all([
        fetchEditPost({ id: postId }),
        fetchMe(),
      ]);

      if (postResponse.errors && postResponse.errors.length > 0) {
        const code = extractGraphQLErrorCode(postResponse.errors);
        if (code === 'POST_NOT_FOUND') {
          setLoadError('존재하지 않는 게시물이거나 삭제된 게시물입니다.');
          setLoadErrorKind('not_found');
        } else {
          setLoadError('게시물 정보를 불러오지 못했어요.');
          setLoadErrorKind('network');
        }
        return;
      }

      const post = postResponse.data?.post;
      if (!post) {
        setLoadError('존재하지 않는 게시물이거나 삭제된 게시물입니다.');
        setLoadErrorKind('not_found');
        return;
      }

      if (meResponse.errors && meResponse.errors.length > 0) {
        setLoadError('게시물 정보를 불러오지 못했어요.');
        setLoadErrorKind('network');
        return;
      }

      const me = meResponse.data?.me;
      if (!me) {
        setLoadError('게시물 정보를 불러오지 못했어요.');
        setLoadErrorKind('network');
        return;
      }

      if (me.id !== post.authorId) {
        setLoadError('수정 권한이 없어 상세 화면으로 이동합니다.');
        setLoadErrorKind('not_found');
        router.replace(`/posts/${postId}`);
        return;
      }

      setValues({ content: post.content, subcontent: post.subcontent ?? '' });
      setImageUrls(post.imageUrls);
    } catch {
      setLoadError('게시물 정보를 불러오지 못했어요.');
      setLoadErrorKind('network');
    } finally {
      setLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!canAddMoreImages(imageUrls.length)) {
        setUploadError('이미지는 최대 4장까지 업로드할 수 있습니다.');
        setRetryTargetFile(null);
        return;
      }

      const validation = validateImageFile(file);
      if (!validation.ok) {
        setUploadError(validation.error);
        setRetryTargetFile(null);
        return;
      }

      setUploading(true);
      setUploadError(null);
      setSubmitError(null);
      setLoginRequired(false);

      try {
        const issueResponse = await issuePostImageUploadUrlForEdit({
          contentType: validation.value.normalizedContentType,
          fileSize: file.size,
        });

        const issuePayload = issueResponse.data?.issuePostImageUploadUrl;
        if (!issuePayload) {
          const code = extractGraphQLErrorCode(issueResponse.errors);
          if (isAuthenticationErrorCode(code)) {
            setUploadError('업로드를 계속하려면 로그인이 필요합니다.');
            setLoginRequired(true);
          } else {
            setUploadError('업로드 URL 발급에 실패했어요. 다시 시도해 주세요.');
          }
          setRetryTargetFile(file);
          return;
        }

        const uploadResponse = await fetch(issuePayload.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': validation.value.normalizedContentType,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('upload failed');
        }

        setImageUrls((prev) => [...prev, issuePayload.imageUrl]);
        setRetryTargetFile(null);
        setUploadError(null);
      } catch {
        setUploadError('이미지 업로드에 실패했어요. 다시 시도해 주세요.');
        setRetryTargetFile(file);
      } finally {
        setUploading(false);
      }
    },
    [imageUrls.length],
  );

  const handleFileChange = useCallback(
    async (event: FormEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const file = input.files?.[0];
      input.value = '';

      if (!file) {
        return;
      }

      await uploadImage(file);
    },
    [uploadImage],
  );

  const retryUpload = useCallback(async () => {
    if (!retryTargetFile || uploading) {
      return;
    }

    await uploadImage(retryTargetFile);
  }, [retryTargetFile, uploadImage, uploading]);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPending(true);
      setSubmitError(null);
      setLoginRequired(false);

      const validationError = validatePostDraft({
        content: values.content,
        subcontent: values.subcontent,
        imageUrls,
      });
      if (validationError) {
        setSubmitError(validationError);
        setPending(false);
        return;
      }

      try {
        const response = await updatePost({
          id: postId,
          content: values.content.trim(),
          subcontent: values.subcontent.trim() || null,
          category: '',
          imageUrls,
        });

        if (response.data?.updatePost?.id) {
          router.push(`/posts/${response.data.updatePost.id}`);
          return;
        }

        const code = extractGraphQLErrorCode(response.errors);
        if (isAuthenticationErrorCode(code)) {
          setSubmitError('로그인이 필요합니다. 다시 로그인해 주세요.');
          setLoginRequired(true);
        } else if (isAuthorizationErrorCode(code)) {
          setSubmitError('수정 권한이 없습니다.');
        } else {
          setSubmitError('게시물을 수정하지 못했어요. 다시 시도해 주세요.');
        }
      } catch {
        setSubmitError('게시물을 수정하지 못했어요. 다시 시도해 주세요.');
      } finally {
        setPending(false);
      }
    },
    [imageUrls, postId, router, values.content, values.subcontent],
  );

  return useMemo(
    () => ({
      values,
      imageUrls,
      loading,
      pending,
      uploading,
      loadError,
      loadErrorKind,
      submitError,
      uploadError,
      loginRequired,
      onChange: (field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
      },
      onSubmit,
      retryLoad: load,
      removeImage: (index) => {
        setImageUrls((prev) =>
          prev.filter((_, currentIndex) => currentIndex !== index),
        );
      },
      handleFileChange,
      retryUpload,
    }),
    [
      handleFileChange,
      imageUrls,
      load,
      loadError,
      loadErrorKind,
      loading,
      loginRequired,
      onSubmit,
      pending,
      retryUpload,
      submitError,
      uploadError,
      uploading,
      values,
    ],
  );
}
