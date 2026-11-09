import { Button } from './button'

export const meta = { name: 'button', description: 'Self-test Button.' }

export const states = {
  default: () => <Button>Continue</Button>,
  secondary: () => <Button variant="secondary">Cancel</Button>,
  disabled: () => <Button disabled>Continue</Button>,
}
