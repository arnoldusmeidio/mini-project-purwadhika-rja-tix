"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useFormLogin, FormTypeLogin } from "./schema/LoginSchema";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useFormLogin();

  const onSubmit: SubmitHandler<FormTypeLogin> = async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <form
        id="loginForm"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <label
          htmlFor="email"
          className="label-text font-semibold text-fourth align-middle text-base ms-2"
        >
          Email Address
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="Type your email"
          name="email"
          id="email"
          className="input input-bordered w-full lg:w-4/5 bg-secondary border-third border-2"
        />
        {errors.email && (
          <div className="text-red-500 label-text font-normal align-middle text-base ms-2">
            {errors.email.message}
          </div>
        )}

        <label
          htmlFor="password"
          className="label-text font-semibold text-fourth align-middle text-base ms-2"
        >
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="Type your pass"
          name="password"
          id="password"
          className="input input-bordered w-full lg:w-4/5 bg-secondary border-third border-2"
        />
        {errors.password && (
          <div className="text-red-500 label-text font-normal align-middle text-base ms-2">
            {errors.password.message}
          </div>
        )}

        <div className="inline-flex align-middle mt-1">
          <input
            type="checkbox"
            defaultChecked
            className="checkbox checkbox-warning border-third border-2"
          />
          <span className="label-text font-medium text-fourth ms-2">
            Remember me
          </span>
        </div>
      </form>
      <button
        disabled={isSubmitting}
        type="submit"
        form="loginForm"
        className="btn w-full lg:w-4/5 bg-third hover:bg-secondary mt-5 font-semibold text-base text-fifth hover:text-white"
      >
        {isSubmitting ? "Loading..." : "Login"}
      </button>
    </>
  );
}