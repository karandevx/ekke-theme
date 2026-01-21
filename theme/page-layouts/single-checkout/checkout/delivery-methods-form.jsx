import React, { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./delivery-methods-form.less";

const DeliveryMethodsForm = ({ onFormSubmit, onBack }) => {
  const [selectedMethod, setSelectedMethod] = useState("delivery_method_01");
  const [isGiftWrappingSelected, setIsGiftWrappingSelected] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      deliveryMethod: "delivery_method_01",
    },
    mode: "onChange",
  });

  const deliveryMethods = [
    {
      id: "delivery_method_01",
      title: "DELIVERY METHOD 01",
      description: "Estimated delivery Sep 03rd",
      price: "AMOUNT",
      isNew: true,
      isSelected: true,
      isSurprise: false,
    },
    {
      id: "delivery_method_02",
      title: "DELIVERY METHOD 02",
      description: "Estimated delivery within 2-4 business days",
      price: "FREE",
      isNew: false,
      isSelected: false,
      isSurprise: false,
    },
    {
      id: "delivery_method_03",
      title: "DELIVERY METHOD 03",
      description: "Estimated delivery Sep 05th",
      price: "FREE",
      isNew: false,
      isSelected: false,
      isSurprise: false,
    },
    {
      id: "gift_wrapping",
      title: "ADD GIFT WRAPPING",
      description: "Details gifting",
      price: "FREE",
      buttonText: "SEND A SURPRISE",
      isSelected: false,
      isNew: false,
      isSurprise: true,
    },
  ];

  const onSubmit = (data) => {
    const formData = {
      ...data,
      selectedMethod: selectedMethod,
      methodDetails: deliveryMethods.find((m) => m.id === selectedMethod),
      giftWrapping: {
        selected: isGiftWrappingSelected,
        details: giftWrapping,
      },
    };

    if (onFormSubmit) {
      onFormSubmit(formData);
    }
  };

  return (
    <div className={styles.deliveryMethodsForm}>
      <div className=" flex flex-col w-full">
        <p className="font-normal leading-[120%] text-ekke-black body-1 !font-road-radio pt-2 pb-6">
          DELIVERY METHOD
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 p-2"
        >
          {/* Delivery Methods Selection */}
          <div className="flex flex-col gap-2 ">
            {deliveryMethods.map((method, index) => (
              <div
                key={method.id}
                className={`${styles.deliveryMethodItem} ${selectedMethod === method.id ? styles.selected : ""} pt-2 pr-2 pb-4 pl-2 cursor-pointer transition-all`}
                onClick={() => setSelectedMethod(method.id)}
              >
                {/* Main container with flex justify-between */}
                <div className="flex flex-col justify-between items-start w-full gap-3">
                  {/* Left side: Radio button and label */}
                  <div className="flex gap-2 w-full">
                    <div className="flex justify-between items-start w-full">
                      <div className="flex justify-between items-center gap-2">
                        <input
                          {...register("deliveryMethod", { required: true })}
                          type="radio"
                          value={method.id}
                          checked={selectedMethod === method.id}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedMethod(method.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={styles.customRadio}
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h3 className="font-road-radio font-bold text-[14px] leading-[120%] text-ekke-black uppercase body-1">
                              {method.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {/* {method.price !== "AMOUNT" && ( */}
                        <div className="font-archivo font-[400] text-[14px] leading-[120%] text-ekke-black body-1">
                          {method.price}
                        </div>
                        {/* )} */}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    <div
                      className={`text-[10px] leading-[120%] text-[#DDDACE] tracking-wider bg-[#5C2E20] p-1 w-fit`}
                    >
                      {method.isSurprise ? "SEND A SURPRISE" : "NEW"}
                    </div>
                    {/* Description with proper indentation */}
                    <div className="w-full ml-2">
                      <p className="font-archivo text-[12px] leading-[120%] text-neutral-light">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gift Wrapping Section */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-2 py-3 w-full bg-white border border-neutral-light text-ekke-black hover:bg-[#f7f7f7] font-archivo uppercase rounded-[1px] text-[12px] font-[400] leading-[120%] cursor-pointer"
              >
                BACK
              </button>
            )}
            <button
              type="submit"
              className="px-2 py-3 w-full bg-[#EEEEEE] text-ekke-black hover:bg-ekke-black hover:text-white font-archivo uppercase rounded-[1px] text-[12px] font-[400] leading-[120%] cursor-pointer"
            >
              SAVE AND CONTINUE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryMethodsForm;
