import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, Delete } from '@nestjs/common';
import { ConfessionsService } from './confessions.service';
import { JwtAuthGuard } from '../guards/jwt.guard';

@Controller('confessions')
@UseGuards(JwtAuthGuard)
export class ConfessionsController {
    constructor(private readonly confessionsService: ConfessionsService) { }

    @Post()
    async create(@Req() req: any, @Body('text') text: string) {
        return this.confessionsService.create(req.user.id, text);
    }

    @Get()
    async findAll(@Req() req: any, @Query('page') page: string, @Query('limit') limit: string) {
        return this.confessionsService.findAll(Number(page) || 1, Number(limit) || 20, req.user.id);
    }

    @Get('me')
    async findMe(@Req() req: any, @Query('page') page: string, @Query('limit') limit: string) {
        return this.confessionsService.findMe(req.user.id, Number(page) || 1, Number(limit) || 20);
    }

    @Post(':id/like')
    async like(@Req() req: any, @Param('id') id: string) {
        return this.confessionsService.like(id, req.user.id);
    }

    @Get(':id/comments')
    async getComments(@Param('id') id: string, @Query('page') page: string, @Query('limit') limit: string) {
        return this.confessionsService.getComments(id, Number(page) || 1, Number(limit) || 20);
    }

    @Post(':id/comments')
    async addComment(@Req() req: any, @Param('id') id: string, @Body('text') text: string) {
        return this.confessionsService.addComment(id, req.user.id, text);
    }

    @Post(':id/report')
    async report(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
        return this.confessionsService.report(id, req.user.id, reason);
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        return this.confessionsService.findOne(id, req.user.id);
    }

    @Delete(':id')
    async delete(@Req() req: any, @Param('id') id: string) {
        return this.confessionsService.delete(id, req.user.id);
    }
}
