import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Slot } from './slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { BookSlotDto } from './dto/book-slot.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot) private readonly slotRepo: Repository<Slot>,
    private readonly aiService: AiService,
  ) {}

  findAll(): Promise<Slot[]> {
    return this.slotRepo.find({
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  create(dto: CreateSlotDto): Promise<Slot> {
    const slot = this.slotRepo.create(dto);
    return this.slotRepo.save(slot);
  }

  async book(id: string, dto: BookSlotDto): Promise<{ slot: Slot; confirmationMessage: string }> {
    const result = await this.slotRepo.update(
      { id, bookedName: IsNull() },
      { bookedName: dto.name, bookedEmail: dto.email },
    );

    if (result.affected === 0) {
      const exists = await this.slotRepo.existsBy({ id });
      if (!exists) throw new NotFoundException('Slot not found');
      throw new ConflictException('This slot has already been booked');
    }

    const slot = await this.slotRepo.findOneByOrFail({ id });
    const confirmationMessage = await this.aiService.writeConfirmation(slot);
    return { slot, confirmationMessage };
  }
}