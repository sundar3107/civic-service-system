import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService) {}

  async saveComplaintPhoto(file: Express.Multer.File) {
    const uploadDir = this.configService.get<string>("UPLOAD_DIR") ?? "./uploads";
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    const fullPath = join(uploadDir, fileName);
    await writeFile(fullPath, file.buffer);

    return {
      fileName,
      filePath: fullPath,
      mimeType: file.mimetype
    };
  }

  async extractExifLocation(
    _file: Express.Multer.File
  ): Promise<{ latitude: number; longitude: number; formattedAddress: string | null } | null> {
    return null;
  }
}
