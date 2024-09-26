// RateTypeSelector.tsx
import React from "react";
import { Form, Input, Dropdown, DropdownProps } from "semantic-ui-react";
import { RateType } from "@daml.js/daml-react/lib/Work/module";

interface RateTypeSelectorProps {
  rateType: RateType;
  onRateTypeChange: (data: DropdownProps) => void;
  onRateAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RateOptions = [
  { key: "hourly", value: "HourlyRate", text: "Hourly" },
  { key: "flat", value: "FlatFee", text: "Flat" },
];

const RateTypeSelector: React.FC<RateTypeSelectorProps> = ({
  rateType,
  onRateTypeChange,
  onRateAmountChange,
}) => {
  return (
    <>
      <Form.Field>
        <label>Rate Type</label>
        <Dropdown
          name="rateType"
          value={rateType.tag}
          onChange={onRateTypeChange}
          placeholder="Select Rate Type"
          fluid
          selection
          options={RateOptions}
          required
        />
      </Form.Field>
      <Form.Field>
        <label>{rateType.tag === "FlatFee" ? "Flat Fee" : "Hourly Rate"}</label>
        <Input
          type="text"
          name={rateType.tag === "FlatFee" ? "amount" : "rate"}
          value={
            rateType.tag === "HourlyRate"
              ? rateType.value.rate
              : rateType.value.amount
          }
          onChange={onRateAmountChange}
          placeholder="Rate Amount"
          required
        />
      </Form.Field>
      {rateType.tag === "HourlyRate" && (
        <Form.Field>
          <label>Number of Hours</label>
          <Input
            type="text"
            name="hours"
            value={rateType.value.hours}
            onChange={onRateAmountChange}
            placeholder="Number of Hours"
            required
          />
        </Form.Field>
      )}
    </>
  );
};

export default RateTypeSelector;
