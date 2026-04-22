import { AppDataSource } from './data-source';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const categoryRepo = AppDataSource.getRepository(Category);
  const productRepo = AppDataSource.getRepository(Product);

  // Admin
  let admin = await userRepo.findOne({ where: { email: 'admin@example.com' } });
  if (!admin) {
    admin = userRepo.create({
      name: 'Administrador',
      email: 'admin@example.com',
      password: await bcrypt.hash('Admin@123', 10),
      role: 'ADMIN',
    });
    await userRepo.save(admin);
    console.log('Admin criado: admin@example.com / Admin@123');
  }

  // Regular user
  let user = await userRepo.findOne({ where: { email: 'user@example.com' } });
  if (!user) {
    user = userRepo.create({
      name: 'Usuário Teste',
      email: 'user@example.com',
      password: await bcrypt.hash('User@123', 10),
      role: 'USER',
    });
    await userRepo.save(user);
    console.log('Usuário criado: user@example.com / User@123');
  }

  // Categories
  let cat1 = await categoryRepo.findOne({ where: { name: 'Eletrônicos' } });
  if (!cat1) {
    cat1 = categoryRepo.create({ name: 'Eletrônicos', description: 'Produtos eletrônicos', owner: user });
    await categoryRepo.save(cat1);
  }

  let cat2 = await categoryRepo.findOne({ where: { name: 'Roupas' } });
  if (!cat2) {
    cat2 = categoryRepo.create({ name: 'Roupas', description: 'Vestuário em geral', owner: user });
    await categoryRepo.save(cat2);
  }

  let cat3 = await categoryRepo.findOne({ where: { name: 'Alimentos' } });
  if (!cat3) {
    cat3 = categoryRepo.create({ name: 'Alimentos', description: 'Produtos alimentícios', owner: admin });
    await categoryRepo.save(cat3);
  }

  // Products
  const p1 = await productRepo.findOne({ where: { name: 'Notebook Dell XPS' } });
  if (!p1) {
    const product = productRepo.create({
      name: 'Notebook Dell XPS',
      description: 'Notebook de alta performance',
      price: 5999.99,
      stock: 10,
      owner: user,
      categories: [cat1],
    });
    await productRepo.save(product);
  }

  const p2 = await productRepo.findOne({ where: { name: 'Camiseta Polo' } });
  if (!p2) {
    const product = productRepo.create({
      name: 'Camiseta Polo',
      description: 'Camiseta polo de algodão',
      price: 79.9,
      stock: 50,
      owner: user,
      categories: [cat2],
    });
    await productRepo.save(product);
  }

  const p3 = await productRepo.findOne({ where: { name: 'Arroz Integral 5kg' } });
  if (!p3) {
    const product = productRepo.create({
      name: 'Arroz Integral 5kg',
      description: 'Arroz integral premium',
      price: 25.5,
      stock: 200,
      owner: admin,
      categories: [cat3],
    });
    await productRepo.save(product);
  }

  console.log('Seed concluído!');
  await AppDataSource.destroy();
}

seed().catch((e) => { console.error(e); process.exit(1); });
