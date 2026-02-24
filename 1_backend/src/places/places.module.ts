import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { Place, PlaceSchema } from '../entities/place.entity';
import { PlaceComment, PlaceCommentSchema } from '../entities/place-comment.entity';
import { User, UserSchema } from '../entities/user.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Place.name, schema: PlaceSchema },
            { name: PlaceComment.name, schema: PlaceCommentSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [PlacesController],
    providers: [PlacesService],
    exports: [PlacesService],
})
export class PlacesModule { }
