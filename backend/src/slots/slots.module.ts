import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './slot.entity';
import { SlotsService } from './slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([Slot])],
   providers: [SlotsService],
})
export class SlotsModule {}