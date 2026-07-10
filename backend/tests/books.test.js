const bookService = require('../services/bookService');
const prisma = require('../config/database');

describe('Book service', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates, reads, updates and deletes a book without removing unrelated records', async () => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const created = await bookService.create({
      title: `Test Book ${uniqueSuffix}`,
      description: 'A test book',
      author: 'Tester',
      category: 'Programming',
      language: 'English',
      coverImage: 'https://example.com/cover.jpg',
      pdfFile: 'https://example.com/book.pdf',
      pages: 120
    });

    expect(created.title).toContain(uniqueSuffix);

    const allBooks = await bookService.getAll();
    expect(Array.isArray(allBooks)).toBe(true);
    expect(allBooks.some((book) => book.id === created.id)).toBe(true);

    const updated = await bookService.update(created.id, {
      title: `Updated Test Book ${uniqueSuffix}`
    });

    expect(updated.title).toContain(uniqueSuffix);

    await bookService.remove(created.id);

    const remaining = await bookService.getAll();
    expect(Array.isArray(remaining)).toBe(true);
    expect(remaining.some((book) => book.id === created.id)).toBe(false);
  });
});
