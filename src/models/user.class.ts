export class User {
  firstName: string = '';
  lastName: string = '';
  birthDate: number = 0;
  streetAddress: string = '';
  zipCode: number = 0;
  city: string = '';
  
    constructor(obj?: Partial<User>) {
      if (obj) {
        Object.assign(this, obj);
      }
    }
  
    toPlainObject(): Record<string, any> {
      return {
        firstName: this.firstName,
        lastName: this.lastName,
        birthDate: this.birthDate,
        streetAddress: this.streetAddress,
        zipCode: this.zipCode,
        city: this.city,
      };
    }
  }
  