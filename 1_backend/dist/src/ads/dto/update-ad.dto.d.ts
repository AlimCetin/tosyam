import { AdStatus } from '../../entities/ad.entity';
export declare class UpdateAdDto {
    title?: string;
    type?: 'image' | 'video';
    mediaUrl?: string;
    linkUrl?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: AdStatus;
    maxImpressions?: number;
    budget?: number;
}
