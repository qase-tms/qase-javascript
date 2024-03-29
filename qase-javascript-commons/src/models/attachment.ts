export type Attachment = {
  file_name: string;
  mime_type: string;
  file_path: string | null;
  content: any;
  size: number;
  id: string;
}