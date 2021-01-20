import { App, Jovo } from 'jovo-framework';

import { GoogleAssistant } from 'jovo-platform-googleassistantconv';
import { JovoDebugger } from 'jovo-plugin-debugger';
import { FileDb } from 'jovo-db-filedb';

const app = new App();

app.use(
	new GoogleAssistant({
		transactions: {
			androidPackageName: 'com.package.demo',
			keyFile: require('./service-account.json'),
		},
	}),
	new JovoDebugger(),
	new FileDb()
);

app.setHandler({
	LAUNCH() {
		return this.toIntent('TransactionDigitalPurchaseRequirementsIntent');
	},

	TransactionDigitalPurchaseRequirementsIntent() {
		// check if digital purchases are available for the user
		this.$googleAction!.$transaction!.checkDigitalPurchaseRequirements();
		this.$googleAction!.setNextScene('TransactionDigitalPurchaseCheck');
	},

	ON_TRANSACTION: {
		async DIGITAL_PURCHASE_CHECK() {
			if (this.$googleAction!.$transaction!.canPurchase()) {
				const skus = await this.$googleAction!.$transaction!.getSkus(
					['testproduct1337'],
					'SKU_TYPE_IN_APP'
				);

				if (skus.length > 0) {
					this.$session.$data.skuId = skus[0].skuId;
					this.ask(`Do you want to buy ${skus[0].title}?`);
				}
			} else {
				this.tell(`You can't use digital purchasing.`);
			}
		},
		ON_COMPLETE_PURCHASE() {
			if (
				this.$googleAction!.$transaction!.getPurchaseCompleteStatus() ===
				'PURCHASE_STATUS_OK'
			) {
				this.tell('Thank you for the purchase.');
			}
		},
	},

	YesIntent() {
		this.$googleAction!.$transaction!.completePurchase(
			this.$session.$data.skuId
		);

		this.$googleAction!.setNextScene('TransactionCompletePurchase');
	},
});
export { app };
