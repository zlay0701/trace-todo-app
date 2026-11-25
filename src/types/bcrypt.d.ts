declare module 'bcrypt' {
  const bcrypt: {
    hash(data: string, saltOrRounds: string | number): Promise<string>;
    compare(data: string, encrypted: string): Promise<boolean>;
    genSalt(rounds?: number): Promise<string>;
  };
  export default bcrypt;
}
