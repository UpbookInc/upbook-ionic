import { Component } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
   selector: 'app-multi-attr',
   templateUrl: './multi-attr.page.html',
   styleUrls: ['./multi-attr.page.scss'],
})
export class MultiAttrPage {
   multiAttrs = [];
   multiAttrName = '';
   multiAttrValueName = '';
   multiAttrSelectMessage = '';
   name: any;

   constructor(private modalController: ModalController, private navParams: NavParams) {

      this.multiAttrName = navParams.data.multiAttrName;
      this.multiAttrValueName = navParams.data.multiAttrValueName;
      this.multiAttrSelectMessage = navParams.data.multiAttrSelectMessage;
      this.name = navParams.data.subjectName;
      const rawMultiAttrs = navParams.data.multiAttr;

      rawMultiAttrs.map(rawMA => {
         rawMA.displayValue = rawMA[this.multiAttrValueName];
         this.multiAttrs.push(rawMA);
      });
   }

   onBack(): void {
      this.close();
   }

   select(selectedAttr): void {
      this.close(selectedAttr);
   }

   cancel(): void {
      this.close();
   }

   private close(selectedAttr?) {
      this.modalController.dismiss({ selectedAttr: selectedAttr });
   }
}
