import { useState } from 'react';

type ValidationSchema<T> = {
  [K in keyof T]?: {
    validate: (value: T[K], allData: T) => boolean;
    message: string;
  };
};

export function useForm<T extends Record<string, any>>(
  initialData: T,
  schema: ValidationSchema<T>,
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = <K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => ({ ...prev, [field]: value }));

    setTouched(prev => ({ ...prev, [field]: true }));

    if (schema[field] && touched[field]) {
      const { validate, message } = schema[field]!;
      const isValid = validate(value, { ...data, [field]: value });

      setErrors(prev => ({
        ...prev,
        [field]: isValid ? undefined : message,
      }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const key in schema) {
      if (schema[key]) {
        const { validate, message } = schema[key]!;
        const value = data[key];
        const fieldIsValid = validate(value, data);

        if (!fieldIsValid) {
          newErrors[key] = message;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);

    const allTouched = Object.keys(schema).reduce((acc, key) => {
      return { ...acc, [key]: true };
    }, {});
    setTouched(prev => ({ ...prev, ...allTouched }));

    return isValid;
  };

  const resetForm = () => {
    setData(initialData);
    setErrors({});
    setTouched({});
  };

  return {
    data,
    errors,
    touched,
    handleChange,
    validate,
    resetForm,
  };
}
