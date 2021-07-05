enum ImageStatus {
  UPLOADED = "UPLOADED",
  POST_UPLOAD_PROCESSING = "POST_UPLOAD_PROCESSING",
  POST_UPLOAD_PROCESSED = "POST_UPLOAD_PROCESSED",
  PUBLISHED = "PUBLISHED",
  VERIFIED = "VERIFIED"
}

export function getAllImageStatuses(): ImageStatus[] {
  return [
    ImageStatus.UPLOADED,
    ImageStatus.POST_UPLOAD_PROCESSING,
    ImageStatus.POST_UPLOAD_PROCESSED,
    ImageStatus.PUBLISHED,
    ImageStatus.VERIFIED
  ];
}

export function isPublishedStatus(status: ImageStatus): boolean {
  return status === ImageStatus.PUBLISHED || status === ImageStatus.VERIFIED;
}

export function getImageStatusColor(status: ImageStatus): string {
  switch (status) {
    case ImageStatus.UPLOADED:
      return "red";
    case ImageStatus.POST_UPLOAD_PROCESSING:
      return "orange";
    case ImageStatus.POST_UPLOAD_PROCESSED:
      return "blue";
    case ImageStatus.PUBLISHED:
      return "cyan";
    case ImageStatus.VERIFIED:
      return "green";
    default:
      return null;
  }
}

export function getImageStatusString(status: ImageStatus): string {
  switch (status) {
    case ImageStatus.UPLOADED:
      return "Just uploaded";
    case ImageStatus.POST_UPLOAD_PROCESSING:
      return "Processing";
    case ImageStatus.POST_UPLOAD_PROCESSED:
      return "Processed";
    case ImageStatus.PUBLISHED:
      return "Published";
    case ImageStatus.VERIFIED:
      return "Verified";
    default:
      return null;
  }
}

export default ImageStatus;
