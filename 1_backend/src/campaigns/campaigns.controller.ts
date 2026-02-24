import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../guards/jwt.guard';

@Controller('campaigns')
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Get()
    findAll(@Query('city') city?: string) {
        return this.campaignsService.findAll(city);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-codes')
    getMyCodes(@Request() req) {
        return this.campaignsService.getMyCodes(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMyCampaigns(@Request() req) {
        return this.campaignsService.findMyCampaigns(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.campaignsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/claim')
    claimCode(@Param('id') id: string, @Request() req) {
        return this.campaignsService.claimCode(id, req.user.id);
    }

    @Post()
    create(@Body() createCampaignDto: any, @Request() req) {
        const userId = req.user?.id || 'guest';
        return this.campaignsService.create(createCampaignDto, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateData: any,
        @Request() req,
    ) {
        return this.campaignsService.update(id, req.user.id, req.user.role, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.campaignsService.remove(id, req.user.id, req.user.role);
    }

    @Get(':id/comments')
    getComments(@Param('id') id: string) {
        return this.campaignsService.getComments(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/comments')
    addComment(
        @Param('id') id: string,
        @Body('text') text: string,
        @Request() req,
    ) {
        return this.campaignsService.addComment(id, req.user.id, text);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/like')
    toggleLike(@Param('id') id: string, @Request() req) {
        return this.campaignsService.toggleLike(id, req.user.id);
    }
}
