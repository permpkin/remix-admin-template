import { useFormikContext } from "formik"
import { Button } from "./Button";

interface FormSubmitProps {
  text?: string
}

export const FormSubmit = ({ text = 'Submit' }:FormSubmitProps) => {
  
  // const { isSubmitting, submitForm } = useFormikContext();

  return (
    <Button
      type="submit"
      // disabled={isSubmitting}
      // onClick={submitForm}
    >
      {text}
    </Button>
  )
}