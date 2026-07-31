"use client";

import { ChangeEvent } from "react";

export const PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_PRODUCT_IMAGES = 10;
export const MAX_PRODUCT_IMAGE_SIZE = 10 * 1024 * 1024;

export type PendingProductImage = {
  clientId: string;
  file: File;
  previewUrl: string;
  isCover: boolean;
  progress: number;
};

type Props = {
  images: PendingProductImage[];
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  onRemove: (clientId: string) => void;
  onMove: (clientId: string, direction: -1 | 1) => void;
  onCover: (clientId: string) => void;
};

export function ProductImagePicker({ images, disabled, onFiles, onRemove, onMove, onCover }: Props) {
  const chooseFiles = (event: ChangeEvent<HTMLInputElement>) => {
    onFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Фотографии</p>
          <p className="text-xs text-[#617168]">JPEG, PNG или WebP, до 10 МБ · {images.length}/10</p>
        </div>
        <label className="cursor-pointer rounded-md border border-[#cad5ce] bg-white px-3 py-2 text-sm font-semibold hover:border-[#9db5a7]">
          Добавить
          <input className="sr-only" type="file" accept={PRODUCT_IMAGE_TYPES.join(",")} multiple disabled={disabled || images.length >= MAX_PRODUCT_IMAGES} onChange={chooseFiles} />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div key={image.clientId} className="overflow-hidden rounded-md border border-[#dfe5db] bg-white">
              {/* Blob previews are local and do not pass through the Next.js optimizer. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.previewUrl} alt={image.file.name} className="aspect-square w-full object-cover" />
              {image.progress > 0 && image.progress < 100 ? (
                <div className="h-1 bg-[#e2e9e3]"><div className="h-full bg-[#1f7a4d]" style={{ width: `${image.progress}%` }} /></div>
              ) : null}
              <div className="space-y-2 p-2 text-xs">
                <button type="button" disabled={disabled} onClick={() => onCover(image.clientId)} className={`w-full rounded px-2 py-1 font-semibold ${image.isCover ? "bg-[#dff2e7] text-[#17613c]" : "bg-[#f1f4f1]"}`}>
                  {image.isCover ? "Обложка" : "Сделать обложкой"}
                </button>
                <div className="flex gap-1">
                  <button type="button" aria-label="Переместить влево" disabled={disabled || index === 0} onClick={() => onMove(image.clientId, -1)} className="flex-1 rounded border py-1 disabled:opacity-40">←</button>
                  <button type="button" aria-label="Переместить вправо" disabled={disabled || index === images.length - 1} onClick={() => onMove(image.clientId, 1)} className="flex-1 rounded border py-1 disabled:opacity-40">→</button>
                  <button type="button" disabled={disabled} onClick={() => onRemove(image.clientId)} className="flex-1 rounded border border-[#efc9c0] py-1 text-[#8a3b25]">×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function coverImageUrl(product: { images?: Array<{ url: string; is_cover: boolean }> }) {
  return product.images?.find((image) => image.is_cover)?.url ?? product.images?.[0]?.url ?? null;
}
