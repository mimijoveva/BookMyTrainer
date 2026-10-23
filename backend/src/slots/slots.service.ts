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

  // Public list for the booking page: no client names or emails
  async findAll() {
    const slots = await this.findOrdered();
    return slots.map(({ bookedName, bookedEmail, ...slot }) => ({
      ...slot,
      booked: bookedName !== null,
    }));
  }

  // Full list for the coach view, including who booked
  async findAllForCoach() {
    const slots = await this.findOrdered();
    return slots.map((slot) => ({ ...slot, booked: slot.bookedName !== null }));
  }

  async create(dto: CreateSlotDto): Promise<Slot> {
    try {
      return await this.slotRepo.save(this.slotRepo.create(dto));
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException('A session already starts at this date and time');
      }
      throw err;
    }
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

  private findOrdered(): Promise<Slot[]> {
    return this.slotRepo.find({ order: { date: 'ASC', startTime: 'ASC' } });
  }
}