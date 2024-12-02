export class User {
    firstName: string;
    lastName: string;
    birthDate: number;
    streetAddress: string;
    zipCode: number;
    city: string;
  
    constructor(obj?: any) {
      this.firstName = obj ? obj.firstName : '';
      this.lastName = obj ? obj.lastName : '';
      this.birthDate = obj ? obj.birthDate : '';
      this.streetAddress = obj ? obj.streetAddress : '';
      this.zipCode = obj ? obj.zipCode : '';
      this.city = obj ? obj.city : '';
    }
  }
  