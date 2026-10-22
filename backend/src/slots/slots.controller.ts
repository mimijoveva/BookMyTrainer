import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { BookSlotDto } from './dto/book-slot.dto';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  findAll() {
    return this.slotsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateSlotDto) {
    return this.slotsService.create(dto);
  }

  @Post(':id/book')
  book(@Param('id', ParseUUIDPipe) id: string, @Body() dto: BookSlotDto) {
    return this.slotsService.book(id, dto);
  }
}