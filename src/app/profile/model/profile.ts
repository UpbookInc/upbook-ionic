export class Profile {

   constructor(
      public firstName: string,
      public lastName: string,
      public primaryNumber?: string,
      public primaryEmail?: string,
      public primaryAddress?: string,
      public organization?: string) {
   }
}