import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { VendedoresService } from './vendedores.service';
import { DesempenhoVendedorDto } from './dto/get-desempenho-response.dto';

@Controller('vendedores')
export class VendedoresController {
  constructor(private readonly vendedoresService: VendedoresService) {}

  @Get(':id/desempenho')
  async getDesempenho(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DesempenhoVendedorDto> {
    return this.vendedoresService.calcularDesempenho(id);
  }
}