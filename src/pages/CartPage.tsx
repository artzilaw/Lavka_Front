import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Truck,
  MapPin,
  CreditCard,
  Banknote,
  Phone,
  CheckCircle2,
  Package,
  Store,
  ArrowRight,
} from 'lucide-react';
import { MainLayout } from '@/app/layouts/MainLayout';
import { useCart } from '@/app/providers/CartContext';
import { cartApi } from '@/entities/cart/api';
import { Order } from '@/entities/cart/model';
import { resolveMediaUrl } from '@/shared/config/env';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Alert } from '@/shared/ui/Alert';

export const CartPage: React.FC = () => {
  const { cart, isLoading, refreshCart, updateQuantity, removeItem, clearCart } = useCart();

  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{ delivery_address?: string; phone?: string }>({});
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setOrdersLoading(true);
    const res = await cartApi.getOrders();
    if (res.success && Array.isArray(res.data)) {
      setOrders(res.data);
    }
    setOrdersLoading(false);
  };

  useEffect(() => {
    refreshCart();
    loadOrders();
  }, [refreshCart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    const nextErrors: { delivery_address?: string; phone?: string } = {};

    if (deliveryMethod === 'delivery' && deliveryAddress.trim().length < 5) {
      nextErrors.delivery_address = 'Укажите адрес доставки (минимум 5 символов)';
    }
    if (!/^[+\d][\d\s\-()]{6,20}$/.test(phone.trim())) {
      nextErrors.phone = 'Введите корректный номер телефона';
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsCheckingOut(true);
    const res = await cartApi.checkout({
      delivery_method: deliveryMethod,
      delivery_address: deliveryMethod === 'delivery' ? deliveryAddress.trim() : 'Самовывоз',
      payment_method: paymentMethod,
      phone: phone.trim(),
      comment: comment.trim(),
    });
    setIsCheckingOut(false);

    if (res.success && res.data) {
      setCompletedOrder(res.data);
      setDeliveryAddress('');
      setComment('');
      await refreshCart();
      await loadOrders();
    } else {
      if (res.fieldErrors) {
        setFieldErrors(res.fieldErrors);
      }
      setCheckoutError(res.error || 'Не удалось оформить покупку');
    }
  };

  const hasUnavailable = cart.items.some((i) => !i.available);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Корзина и покупки
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Управляйте выбранными товарами и оформляйте заказы
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-2xl bg-white border border-slate-200 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'cart'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Корзина ({cart.total_items})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Мои заказы ({orders.length})
            </button>
          </div>
        </div>

        {completedOrder && (
          <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-extrabold text-emerald-900">
                  Заказ №{completedOrder.id} успешно оформлен!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-700 mt-0.5">
                  Сумма: {completedOrder.total_price.toLocaleString('ru-RU')} ₽ •{' '}
                  {completedOrder.delivery_method === 'pickup'
                    ? 'Самовывоз'
                    : `Доставка: ${completedOrder.delivery_address}`}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCompletedOrder(null);
                setActiveTab('orders');
              }}
            >
              <span>К истории заказов</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {activeTab === 'cart' ? (
          isLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-sm text-slate-500">
              Загружаем корзину...
            </div>
          ) : cart.items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-14 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-extrabold text-slate-800">Ваша корзина пока пуста</p>
                <p className="text-sm text-slate-500">
                  Выберите нужные объявления в каталоге и добавьте их в корзину
                </p>
              </div>
              <Link to="/" className="inline-block">
                <Button variant="primary">Перейти к объявлениям</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-6 items-start">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-bold text-slate-700">
                    Товаров в корзине: {cart.total_items}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearCart()}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Очистить корзину</span>
                  </button>
                </div>

                {cart.items.map((item) => {
                  const photo = resolveMediaUrl(item.ad.photos?.[0], '/images/logo/logo.svg');
                  const itemSum = item.ad.price * item.quantity;

                  return (
                    <div
                      key={item.ad_id}
                      className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row gap-4 shadow-sm ${
                        item.available ? 'border-slate-200/80' : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <Link
                        to={`/ads/${item.ad_id}`}
                        className="w-full sm:w-32 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0"
                      >
                        <img
                          src={photo}
                          alt={item.ad.title}
                          onError={(e) => {
                            e.currentTarget.src = '/images/logo/logo.svg';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              to={`/ads/${item.ad_id}`}
                              className="text-base font-extrabold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2"
                            >
                              {item.ad.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              <Link
                                to={`/sellers/${item.ad.seller_id}`}
                                className="inline-flex items-center gap-1 hover:text-indigo-600 font-semibold"
                              >
                                <Store className="w-3.5 h-3.5" />
                                <span>{item.seller_name}</span>
                              </Link>
                              <span>•</span>
                              <span>{item.ad.location}</span>
                            </div>
                            {!item.available && (
                              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                                Товар больше недоступен — удалите из корзины
                              </span>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-lg font-extrabold text-slate-900">
                              {itemSum === 0 ? 'Бесплатно' : `${itemSum.toLocaleString('ru-RU')} ₽`}
                            </div>
                            {item.quantity > 1 && item.ad.price > 0 && (
                              <div className="text-xs text-slate-400">
                                {item.ad.price.toLocaleString('ru-RU')} ₽ / шт.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.ad_id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors"
                              aria-label="Уменьшить количество"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.ad_id, item.quantity + 1)}
                              disabled={!item.available}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors disabled:opacity-40"
                              aria-label="Увеличить количество"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.ad_id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Удалить</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={handleCheckout}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5 lg:sticky lg:top-28"
              >
                <h2 className="text-lg font-extrabold text-slate-900">Оформление покупки</h2>

                {checkoutError && <Alert type="error" message={checkoutError} />}

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Способ получения
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        deliveryMethod === 'delivery'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>Доставка</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        deliveryMethod === 'pickup'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Самовывоз</span>
                    </button>
                  </div>
                </div>

                {deliveryMethod === 'delivery' && (
                  <Input
                    id="checkout-address"
                    label="Адрес доставки *"
                    placeholder="Город, улица, дом, квартира"
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      if (fieldErrors.delivery_address) {
                        setFieldErrors((p) => ({ ...p, delivery_address: undefined }));
                      }
                    }}
                    error={fieldErrors.delivery_address}
                    icon={<MapPin className="w-4 h-4" />}
                  />
                )}

                <Input
                  id="checkout-phone"
                  label="Телефон для связи *"
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (fieldErrors.phone) {
                      setFieldErrors((p) => ({ ...p, phone: undefined }));
                    }
                  }}
                  error={fieldErrors.phone}
                  icon={<Phone className="w-4 h-4" />}
                />

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Способ оплаты
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Картой онлайн</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>При получении</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="checkout-comment"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Комментарий к заказу
                  </label>
                  <textarea
                    id="checkout-comment"
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Удобное время доставки или пожелания..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Товары ({cart.total_items} шт.)</span>
                    <span>{cart.total_price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Доставка</span>
                    <span className="text-emerald-600 font-semibold">Бесплатно</span>
                  </div>
                  <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Итого</span>
                    <span>{cart.total_price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isCheckingOut}
                  disabled={hasUnavailable}
                >
                  Оформить покупку
                </Button>
              </form>
            </div>
          )
        ) : ordersLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            Загружаем историю заказов...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-14 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-base font-extrabold text-slate-800">У вас пока нет заказов</p>
            <p className="text-xs sm:text-sm text-slate-500">
              После оформления покупки из корзины заказ появится здесь
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-extrabold text-slate-900">
                        Заказ №{order.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                        Подтверждён
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(order.created_at).toLocaleString('ru-RU')} •{' '}
                      {order.delivery_method === 'pickup'
                        ? 'Самовывоз'
                        : `Доставка: ${order.delivery_address}`}
                    </p>
                  </div>
                  <div className="text-lg font-extrabold text-indigo-600">
                    {order.total_price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <div className="space-y-2.5">
                  {order.items.map((it, idx) => (
                    <div
                      key={`${order.id}-${it.ad_id}-${idx}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={resolveMediaUrl(it.photo, '/images/logo/logo.svg')}
                          alt={it.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/ads/${it.ad_id}`}
                            className="font-bold text-slate-800 hover:text-indigo-600 block truncate"
                          >
                            {it.title}
                          </Link>
                          <span className="text-xs text-slate-400">
                            Продавец: {it.seller_name} • {it.quantity} шт.
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800 shrink-0">
                        {(it.price * it.quantity).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
