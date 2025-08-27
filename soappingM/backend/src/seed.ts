// backend/src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  console.log('Seeding initial products...');

  // 👇 여기에 추가하고 싶은 상품 데이터를 자유롭게 넣으세요.
  const productsToSeed = [
    {
      name: 'Savon de Lune (달의 비누)',
      price: 10000,
      description:
        '프랑스어 느낌으로 고급스럽게, 달빛처럼 은은하고 순수한 이미지를 강조.\n달밤에 피어난 라벤더, 은은한 머스크 향 → 힐링·휴식 컨셉.',
      imageUrl: '비누5.jpg',
      category: 'soap',
      stock: 20,
      isFeatured: false,
      status: 'selling',
      sortOrder: 1,
    },
    {
      name: 'Aurora Essence (오로라 에센스)',
      price: 11000,
      description:
        '북극광처럼 신비롭고 희귀한 자연의 향기를 담았다는 의미.\n멀티컬러 마블 디자인, 시트러스 + 우디 계열의 조화로운 향.',
      imageUrl: '비누2.jpg',
      category: 'soap',
      stock: 20,
      isFeatured: false,
      status: 'selling',
      sortOrder: 2,
    },
    {
      name: 'Velour Purity (벨벳 같은 순수함)',
      price: 11000,
      description:
        '‘Velour(벨벳)’은 부드럽고 고급스러운 감촉을 연상시킴.\n진주가루나 미네랄이 들어간 화이트톤 비누, 부드러운 촉감 강조.',
      imageUrl: '비누4.jpg',
      category: 'soap',
      stock: 20,
      isFeatured: false,
      status: 'selling',
      sortOrder: 3,
    },
    {
      name: 'Elysian Soap (엘리시안 솝)',
      price: 11000,
      description:
        '‘Elysian’은 신성하고 완벽한 공간을 의미.\n플로럴 + 허브 향의 조화, 천국 정원 같은 청량감.',
      imageUrl: '비누3.jpg',
      category: 'soap',
      stock: 20,
      isFeatured: false,
      status: 'selling',
      sortOrder: 4,
    },
    {
      name: 'Noir Élégance (우아한 검정)',
      price: 11000,
      description:
        '숯(차콜) 비누에 어울리는 네이밍. 블랙 톤인데 우아함을 강조.\n프리미엄 숯, 블랙 클레이 원료 → 피부 정화 + 고급스러운 이미지.',
      imageUrl: '비누1.jpg',
      category: 'soap',
      stock: 20,
      isFeatured: false,
      status: 'selling',
      sortOrder: 5,
    },
    {
      name: 'L’Atelier Savon (비누 공방)',
      price: 11000,
      description:
        '프렌치 스타일, 장인 정신과 수제 감성을 강조하는 네이밍.\n핸드메이드 비누의 프리미엄 버전. 고객 맞춤 블렌딩 강조.',
      imageUrl: '비누6.jpg',
      category: 'soap',
      stock: 20,
      isFeatured: false,
      status: 'selling',
      sortOrder: 6,
    },
    {
      name: 'Serenity Glow (평온의 빛)',
      price: 11000,
      description:
        '마음을 편안하게 하는 차분한 불빛.\n라벤더 + 버가못 + 세이지 → 스트레스 완화, 힐링 공간 연출.',
      imageUrl: '캔들1.jpg',
      category: 'candle',
      stock: 20,
      isFeatured: false,
      status: 'selling',
      sortOrder: 7,
    },
    {
      name: 'Aurora Candle (오로라 캔들)',
      price: 11000,
      description:
        '오로라처럼 다채롭고 희귀한 빛을 담은 캔들.\n민트, 유칼립투스, 화이트 머스크 → 상쾌하면서도 신비로운 향.',
      imageUrl: '캔들2.jpg',
      category: 'candle',
      stock: 20,
      isFeatured: false,
      status: 'selling',
      sortOrder: 8,
    },
    {
      name: 'Noir Céleste (천상의 어둠)',
      price: 11000,
      description:
        '차콜 블랙 컬러 캔들에 잘 어울리는 이름.\블랙커런트 + 인센스 + 오크우드 → 묵직하고 고급스러운 향.',
      imageUrl: '캔들3.jpg',
      category: 'candle',
      stock: 20,
      isFeatured: false,
      status: 'selling',
      sortOrder: 9,
    },
  ];

  for (const productData of productsToSeed) {
    await productsService.create(productData as any);
  }

  console.log('Seeding completed!');
  await app.close();
}

bootstrap();
