"use client";

import {
  FormTypeCreatePayment,
  useFormCreatePayment,
} from "@/components/schema/PaymentSchema";
import { AdminVoucher, BookingData, Seat, User } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, FormProvider, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

export default function page() {
  const [user, setUser] = useState<User>();
  const [adminVouchers, setAdminVouchers] = useState<AdminVoucher>();
  const searchParams = useSearchParams();
  const passedData = searchParams.get("data");
  const bookingData: BookingData[] = JSON.parse(passedData as string);

  const methods = useFormCreatePayment();
  const {
    handleSubmit,
    reset,
    watch,
    resetField,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const voucher = watch("voucher");
  const point = watch("points");
  const adminVoucherId = watch("adminVoucherId");
  const adminVoucherDiscount = watch("adminVoucherDiscount");

  const seats = bookingData.map((item) => {
    const container = {} as { row: number; column: number };

    container.row = item.row;
    container.column = item.column;
    return container;
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<FormTypeCreatePayment> = async (formData) => {
    console.log(formData);
    try {
      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_SERVER_PORT}/api/v1/showtimes`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(formData),
      //     credentials: "include",
      //   }
      // );
      // const data = await response.json();
      // if (!response.ok) {
      //   if (data.message) {
      //     toast.error(data.message);
      //   } else {
      //     toast.error(data.errors[0].message);
      //   }
      // } else {
      //   toast.success(data.message);
      //   reset();
      //   // router.push("/test-page");
      // }
      // router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const adminVoucherParam = adminVoucherId ? adminVoucherId : "-";

  const handleClick = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_PORT}/api/v1/vouchers/${adminVoucherParam}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setAdminVouchers(data.data);
      if (!response.ok) {
        if (data.message) {
          toast.error(data.message);
        } else {
          toast.error(data.errors[0].message);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    async function getUser() {
      try {
        const movie = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_PORT}/api/v1/users`,
          {
            credentials: "include",
          }
        );
        const data = await movie.json();
        setUser(data.data);
      } catch (error) {
        console.error(error);
      }
    }
    getUser();
  }, []);

  const pointsArr = [];
  if (user) {
    let totalPrice = bookingData[0].price * bookingData.length;
    let maxPoints = 0;
    if (user.totalPoints >= totalPrice) {
      maxPoints = totalPrice;
    } else {
      maxPoints = user.totalPoints;
    }

    for (let i = 1; i <= maxPoints / 10000; i++) {
      pointsArr.push(10000 * i);
    }
  }

  let initialPrice = Number(bookingData[0].price) * bookingData.length;
  let totalPrice = initialPrice;

  if (Number(point) && Number(voucher) && Number(adminVoucherDiscount)) {
    const priceMinusPoint = initialPrice - Number(point);
    const discountedPrice1 =
      priceMinusPoint -
      ((initialPrice - Number(point)) * Number(voucher)) / 100;
    totalPrice =
      discountedPrice1 -
      (discountedPrice1 * Number(adminVoucherDiscount)) / 100;
  } else if (Number(point) && Number(voucher)) {
    totalPrice =
      initialPrice -
      Number(point) -
      ((initialPrice - Number(point)) * Number(voucher)) / 100;
  } else if (Number(point) && Number(adminVoucherDiscount)) {
    totalPrice =
      initialPrice -
      Number(point) -
      ((initialPrice - Number(point)) * Number(adminVoucherDiscount)) / 100;
  } else if (Number(voucher) && Number(adminVoucherDiscount)) {
    totalPrice =
      initialPrice -
      (initialPrice * Number(voucher)) / 100 -
      ((initialPrice - (initialPrice * Number(voucher)) / 100) *
        Number(adminVoucherDiscount)) /
        100;
  } else if (Number(point)) {
    totalPrice = initialPrice - Number(point);
  } else if (Number(voucher)) {
    totalPrice = initialPrice - (initialPrice * Number(voucher)) / 100;
  } else if (Number(adminVoucherDiscount)) {
    totalPrice =
      initialPrice - (initialPrice * Number(adminVoucherDiscount)) / 100;
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-2">
        <div>Confirm Payment</div>
        <div>Seat Payment:</div>

        {/* nampilin harga x jmlh kursi */}
        <div>{`Rp.${bookingData[0].price},00 x ${bookingData.length}`}</div>

        <div>Selection Seat:</div>
        <div className="flex gap-5">
          {bookingData.map(({ row, column }) => (
            <div key={`${row}-${column}`}>{`${row}.${column}`}</div>
          ))}
        </div>

        {/* Form point dan voucher */}
        <form
          id="payment"
          className="flex flex-col gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label htmlFor="points">Points</label>
          <select
            defaultValue=""
            id="points"
            {...methods.register("points", {
              valueAsNumber: true,
            })}
          >
            {/* logic untuk cek punya point atau tdk*/}
            {user?.totalPoints === 0 ? (
              <option value="" disabled hidden>
                You have no points
              </option>
            ) : (
              <option value="" disabled hidden>
                Select amount of points to use
              </option>
            )}

            {pointsArr.map((point, idx) => (
              <option key={idx} value={point}>
                {`${point} Points`}
              </option>
            ))}
          </select>
          {errors.points && (
            <div className="text-red-500 label-text font-normal align-middle text-base ms-2">
              {errors.points.message}
            </div>
          )}
          <button type="button" onClick={() => resetField("points")}>
            Remove points
          </button>

          <label htmlFor="points">Voucher</label>
          <select
            defaultValue=""
            id="points"
            {...methods.register("voucher", {
              valueAsNumber: true,
            })}
          >
            {/* logic untuk cek punya voucher atau tdk*/}
            {user?.vouchers.length === 0 ? (
              <option value="" disabled hidden>
                You have no vouchers
              </option>
            ) : (
              <option value="" disabled hidden>
                Select voucher
              </option>
            )}

            {user?.vouchers.map((voucher) => (
              <option key={voucher.id} value={voucher.discount}>
                {`Discount ${voucher.discount}%`}
              </option>
            ))}
          </select>
          {errors.voucher && (
            <div className="text-red-500 label-text font-normal align-middle text-base ms-2">
              {errors.voucher.message}
            </div>
          )}
          <button type="button" onClick={() => resetField("voucher")}>
            Remove voucher
          </button>

          <div className="flex flex-col">
            <label htmlFor="promoCode">PROMO CODE</label>
            <input
              type="text"
              id="promoCode"
              placeholder="Type the promo code"
              {...methods.register("adminVoucherId")}
            />

            {/* Tombol untuk cek ketersediaan kode promo*/}
            <button type="button" onClick={handleClick}>
              Check code
            </button>

            {/* Kalau ketemu vouchernya, akan keluar tombol "use discount"*/}
            {adminVouchers ? (
              <button
                type="button"
                onClick={() =>
                  setValue(
                    "adminVoucherDiscount",
                    Number(adminVouchers.discount)
                  )
                }
              >
                Use discount {adminVouchers.discount}%
              </button>
            ) : null}
            {errors.adminVoucherDiscount && (
              <div className="text-red-500 label-text font-normal align-middle text-base ms-2">
                {errors.adminVoucherDiscount.message}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setValue("adminVoucherDiscount", Number(0));
              resetField("adminVoucherId");
              setAdminVouchers(undefined);
            }}
          >
            Remove voucher
          </button>
        </form>

        <div className="grid grid-cols-2">
          <div>
            <div>Total Payment</div>
            {/* Tampilan harga kalau ada diskon yg valid, maka harga awal akan dicoret, dan harga diskon muncul di bawahnya*/}
            <div
              className={`${
                Number(point) || Number(voucher) || Number(adminVoucherDiscount)
                  ? "line-through"
                  : null
              }`}
            >{`Rp.${initialPrice},00`}</div>

            {/* Kalau ada diskon, maka total diskon akan ditampilkan di sini */}
            {Number(point) ||
            Number(voucher) ||
            Number(adminVoucherDiscount) ? (
              <div>{`Rp.${totalPrice},00`}</div>
            ) : null}
          </div>
          {Number(point) ? (
            <div>{`You save ${initialPrice - totalPrice},00`}</div>
          ) : null}
        </div>

        {/* Tombol Pay */}
        <button type="submit" form="payment">
          PAY
        </button>
      </div>
    </FormProvider>
  );
}
