import { CartService } from './cart.service';

describe('CartService', () => {
  it('uses the product price when creating a cart', async () => {
    const save = jest.fn().mockResolvedValue({ ok: true });
    const cartModelCtor = jest.fn().mockImplementation(() => ({ save })) as any;
    cartModelCtor.findOne = jest.fn().mockResolvedValue(null);

    const productModel = {
      findById: jest.fn().mockResolvedValue({ price: 50 }),
    } as any;

    const service = new CartService(cartModelCtor, productModel);

    await service.create(
      {
        items: [{ productId: 'product-1', quantity: 2, price: 999 }],
      } as any,
      'user-1',
    );

    expect(productModel.findById).toHaveBeenCalledWith('product-1');
    expect(save).toHaveBeenCalled();
    const createdPayload = cartModelCtor.mock.calls[0][0];
    expect(createdPayload.items[0].price).toBe(50);
    expect(createdPayload.total).toBe(100);
  });
});
