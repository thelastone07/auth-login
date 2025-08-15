interface Props {
  name: string;
}

export default function Hello({ name }: Props) {
  return <h1>Hello, {name}!</h1>;
}
