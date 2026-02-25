'use client';

import Link from 'next/link';
import { POST_IMAGE_UPLOAD_ALLOWED_MIME_TYPES } from '@nadoharu/shared';
import { useNewPostForm } from './useNewPostForm';

const ACCEPTED_IMAGE_TYPES = POST_IMAGE_UPLOAD_ALLOWED_MIME_TYPES.join(',');

export function NewPostForm() {
  const {
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
  } = useNewPostForm();

  return (
    <main className="mx-auto max-w-2xl px-4 py-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h1 className="text-xl font-bold">새 게시물</h1>
        <p className="mt-1 text-sm text-neutral-500">
          오늘의 하루를 짧게 남겨 보세요.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">본문</span>
            <textarea
              name="content"
              rows={4}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">보조 문구</span>
            <textarea
              name="subcontent"
              rows={2}
              value={subcontent}
              onChange={(event) => setSubcontent(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
          </label>

          <div>
            <label
              htmlFor="post-images"
              className="mb-1 block text-sm font-medium"
            >
              이미지 첨부
            </label>
            <input
              id="post-images"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              onChange={(event) => {
                void handleFileChange(event);
              }}
              disabled={uploading || pending}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-violet-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-violet-700 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <p className="mt-1 text-xs text-neutral-500">
              최대 4장까지 업로드할 수 있어요.
            </p>
          </div>

          {imageUrls.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {imageUrls.map((imageUrl, index) => (
                <li
                  key={imageUrl}
                  className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
                >
                  <img
                    src={imageUrl}
                    alt={`업로드 이미지 ${index + 1}`}
                    className="h-28 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {uploadError ? (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-900/70 dark:bg-rose-950/40">
            <p
              role="alert"
              className="font-medium text-rose-700 dark:text-rose-300"
            >
              {uploadError}
            </p>
            <button
              type="button"
              onClick={() => {
                void retryUpload();
              }}
              className="mt-2 rounded-md border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/30"
            >
              업로드 재시도
            </button>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-rose-600">
            {error}
          </p>
        ) : null}

        {loginRequired ? (
          <Link
            href="/login"
            className="mt-3 inline-flex text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            로그인하러 가기
          </Link>
        ) : null}

        <div className="mt-5 flex items-center justify-between">
          <Link
            href="/posts"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={pending || uploading}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? '작성 중...' : '작성하기'}
          </button>
        </div>
      </form>
    </main>
  );
}
