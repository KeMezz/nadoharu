'use client';

import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from './createPost.mutation';
import { issuePostImageUploadUrl } from './issuePostImageUploadUrl.mutation';
import {
  canAddMoreImages,
  extractGraphQLErrorCode,
  isAuthenticationErrorCode,
  validateImageFile,
  validatePostDraft,
} from '@/lib/posts/post-form';

interface UseNewPostFormResult {
  content: string;
  subcontent: string;
  imageUrls: string[];
  pending: boolean;
  uploading: boolean;
  error: string | null;
  uploadError: string | null;
  loginRequired: boolean;
  setContent: (value: string) => void;
  setSubcontent: (value: string) => void;
  removeImage: (index: number) => void;
  handleFileChange: (event: FormEvent<HTMLInputElement>) => Promise<void>;
  retryUpload: () => Promise<void>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useNewPostForm(): UseNewPostFormResult {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [subcontent, setSubcontent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loginRequired, setLoginRequired] = useState(false);
  const [retryTargetFile, setRetryTargetFile] = useState<File | null>(null);

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
      setError(null);
      setLoginRequired(false);

      try {
        const issueResponse = await issuePostImageUploadUrl({
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

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setLoginRequired(false);

      const validationError = validatePostDraft({
        content,
        subcontent,
        imageUrls,
      });
      if (validationError) {
        setError(validationError);
        return;
      }

      setPending(true);
      try {
        const response = await createPost({
          content: content.trim(),
          subcontent: subcontent.trim() || null,
          category: '',
          imageUrls,
        });

        if (response.data?.createPost?.id) {
          router.push(`/posts/${response.data.createPost.id}`);
          return;
        }

        const code = extractGraphQLErrorCode(response.errors);
        if (isAuthenticationErrorCode(code)) {
          setError('로그인이 필요합니다. 다시 로그인해 주세요.');
          setLoginRequired(true);
        } else {
          setError('게시물을 작성하지 못했어요. 다시 시도해 주세요.');
        }
      } catch {
        setError('게시물을 작성하지 못했어요. 다시 시도해 주세요.');
      } finally {
        setPending(false);
      }
    },
    [content, imageUrls, router, subcontent],
  );

  const removeImage = useCallback((index: number) => {
    setImageUrls((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  }, []);

  return useMemo(
    () => ({
      content,
      subcontent,
      imageUrls,
      pending,
      uploading,
      error,
      uploadError,
      loginRequired,
      setContent,
      setSubcontent,
      removeImage,
      handleFileChange,
      retryUpload,
      handleSubmit,
    }),
    [
      content,
      error,
      handleFileChange,
      handleSubmit,
      imageUrls,
      loginRequired,
      pending,
      removeImage,
      retryUpload,
      subcontent,
      uploadError,
      uploading,
    ],
  );
}
