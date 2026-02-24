import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PlacesService } from './places.service';
import { JwtAuthGuard } from '../guards/jwt.guard';

@Controller('places')
export class PlacesController {
    constructor(private readonly placesService: PlacesService) { }

    @Get()
    findAll(
        @Query('city') city?: string,
        @Query('category') category?: string,
    ) {
        return this.placesService.findAll(city, category);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMyPlaces(@Request() req) {
        return this.placesService.findMyPlaces(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.placesService.findOne(id);
    }

    @Post()
    create(@Body() createPlaceDto: any, @Request() req) {
        const userId = req.user?.id || 'guest';
        return this.placesService.create(createPlaceDto, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateData: any,
        @Request() req,
    ) {
        return this.placesService.update(id, req.user.id, req.user.role, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.placesService.remove(id, req.user.id, req.user.role);
    }

    @Get(':id/comments')
    getComments(@Param('id') id: string) {
        return this.placesService.getComments(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/comments')
    addComment(
        @Param('id') id: string,
        @Body('text') text: string,
        @Request() req,
    ) {
        return this.placesService.addComment(id, req.user.id, text);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/like')
    toggleLike(@Param('id') id: string, @Request() req) {
        return this.placesService.toggleLike(id, req.user.id);
    }
}
