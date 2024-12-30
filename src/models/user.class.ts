// export class User {
//   id?: string;
//   firstName: string = '';
//   lastName: string = '';
//   birthDate: number = 0;
//   streetAddress: string = '';
//   zipCode: number = 0;
//   city: string = '';

//     constructor(obj?: Partial<User>) {
//       if (obj) {
//         Object.assign(this, obj);
//       }
//     }

//     toPlainObject(): Record<string, any> {
//       return {
//         id: this.id,
//         firstName: this.firstName,
//         lastName: this.lastName,
//         birthDate: this.birthDate,
//         streetAddress: this.streetAddress,
//         zipCode: this.zipCode,
//         city: this.city,
//       };
//     }
//   }
export class User {
  uid?: string = '';
  id?: string = '';
  firstName: string = '';
  lastName: string = '';
  email?: string = '';
  countryCode?: string = '';
  phoneNumber?: string = '';
  birthDate: number = 0;
  streetAddress: string = '';
  zipCode: string = '';
  city: string = '';
  accounts: string[] = [];
  role: 'user' | 'admin' | 'support' | 'management' = 'user';
  status?: 'active' | 'inactive' | 'closed' = 'active';
  profilePictureUrl?: string = '';
  assignedAdvisorId?: string = '';
  nationality?: string = '';
  taxId?: string = '';
  occupation?: string = '';
  lastLogin: number = Date.now();

  constructor(obj?: Partial<User>) {
    if (obj) {
      Object.assign(this, obj);
    }
  }

  toPlainObject(): Record<string, any> {
    return {
      uid: this.uid,
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      countryCode: this.countryCode,
      phoneNumber: this.phoneNumber,
      birthDate: this.birthDate,
      streetAddress: this.streetAddress,
      zipCode: this.zipCode,
      city: this.city,
      accounts: this.accounts,
      role: this.role,
      status: this.status,
      profilePictureUrl: this.profilePictureUrl,
      assignedAdvisorId: this.assignedAdvisorId,
      nationality: this.nationality,
      taxId: this.taxId,
      occupation: this.occupation,
      lastLogin: this.lastLogin,
    };
  }
}
