import { IsString, IsUrl, IsOptional, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Video must be a valid URL' })
  video?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2200, { message: 'Caption must be at most 2200 characters' })
  caption?: string;

  @IsOptional()
  isPrivate?: boolean;

  @IsOptional()
  hiddenFromFollowers?: string[];
}

