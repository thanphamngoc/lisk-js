/*
 * Copyright © 2017 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import transfer from 'transactions/0_transfer';
// Require is used for stubbing
const time = require('transactions/utils/time');

describe('#transfer transaction', () => {
	const fixedPoint = 10 ** 8;
	const recipientId = '58191285901858109L';
	const testData = 'data';
	const passphrase = 'secret';
	const secondPassphrase = 'second secret';
	const transactionType = 0;
	const publicKey =
		'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
	const amount = '1000';
	const fee = (0.1 * fixedPoint).toString();
	const feeWithData = (0.2 * fixedPoint).toString();
	const timeWithOffset = 38350076;

	let getTimeWithOffsetStub;
	let transferTransaction;

	beforeEach(() => {
		getTimeWithOffsetStub = sandbox
			.stub(time, 'getTimeWithOffset')
			.returns(timeWithOffset);
		return Promise.resolve();
	});

	describe('with first passphrase', () => {
		describe('without data', () => {
			beforeEach(() => {
				transferTransaction = transfer({
					recipientId,
					amount,
					passphrase,
				});
				return Promise.resolve();
			});

			it('should create a transfer transaction', () => {
				return expect(transferTransaction).to.be.ok;
			});

			it('should use time.getTimeWithOffset to calculate the timestamp', () => {
				return expect(getTimeWithOffsetStub).to.be.calledWithExactly(undefined);
			});

			it('should use time.getTimeWithOffset with an offset of -10 seconds to calculate the timestamp', () => {
				const offset = -10;
				transfer({
					recipientId,
					amount,
					passphrase,
					timeOffset: offset,
				});

				return expect(getTimeWithOffsetStub).to.be.calledWithExactly(offset);
			});

			it('should be an object', () => {
				return expect(transferTransaction).to.be.an('object');
			});

			it('should have id string', () => {
				return expect(transferTransaction)
					.to.have.property('id')
					.and.be.a('string');
			});

			it('should have type number equal to 0', () => {
				return expect(transferTransaction)
					.to.have.property('type')
					.and.be.a('number')
					.and.equal(transactionType);
			});

			it('should have amount string equal to provided amount', () => {
				return expect(transferTransaction)
					.to.have.property('amount')
					.and.be.a('string')
					.and.equal(amount);
			});

			it('should have fee string equal to transfer fee', () => {
				return expect(transferTransaction)
					.to.have.property('fee')
					.and.be.a('string')
					.and.equal(fee);
			});

			it('should have recipientId string equal to provided recipient id', () => {
				return expect(transferTransaction)
					.to.have.property('recipientId')
					.and.be.a('string')
					.and.equal(recipientId);
			});

			it('should have senderPublicKey hex string equal to sender public key', () => {
				return expect(transferTransaction)
					.to.have.property('senderPublicKey')
					.and.be.hexString.and.equal(publicKey);
			});

			it('should have timestamp number equal to result of time.getTimeWithOffset', () => {
				return expect(transferTransaction)
					.to.have.property('timestamp')
					.and.be.a('number')
					.and.equal(timeWithOffset);
			});

			it('should have signature hex string', () => {
				return expect(transferTransaction).to.have.property('signature').and.be
					.hexString;
			});

			it('should have an empty asset object', () => {
				return expect(transferTransaction)
					.to.have.property('asset')
					.and.be.an('object').and.be.empty;
			});

			it('should not have the second signature property', () => {
				return expect(transferTransaction).not.to.have.property(
					'signSignature',
				);
			});
		});

		describe('with data', () => {
			beforeEach(() => {
				transferTransaction = transfer({
					recipientId,
					amount,
					passphrase,
					data: testData,
				});
				return Promise.resolve();
			});

			it('should handle invalid (non-utf8 string) data', () => {
				return expect(
					transfer.bind(null, {
						recipientId,
						amount,
						passphrase,
						data: Buffer.from('hello'),
					}),
				).to.throw(
					'Invalid encoding in transaction data. Data must be utf-8 encoded.',
				);
			});

			it('should have fee string equal to transfer with data fee', () => {
				return expect(transferTransaction)
					.to.have.property('fee')
					.and.be.a('string')
					.and.equal(feeWithData);
			});

			describe('data asset', () => {
				it('should be a string equal to provided data', () => {
					return expect(transferTransaction.asset)
						.to.have.property('data')
						.and.be.a('string')
						.and.equal(testData);
				});
			});
		});
	});

	describe('with first and second passphrase', () => {
		beforeEach(() => {
			transferTransaction = transfer({
				recipientId,
				amount,
				passphrase,
				secondPassphrase,
			});
			return Promise.resolve();
		});

		it('should create a transfer transaction with data property', () => {
			transferTransaction = transfer({
				recipientId,
				amount,
				passphrase,
				secondPassphrase,
				data: testData,
			});

			return expect(transferTransaction.asset).to.have.property('data');
		});

		it('should have the second signature property as hex string', () => {
			return expect(transferTransaction).to.have.property('signSignature').and
				.be.hexString;
		});
	});

	describe('unsigned transfer transaction', () => {
		describe('when the transfer transaction is created without a passphrase', () => {
			beforeEach(() => {
				transferTransaction = transfer({
					recipientId,
					amount,
				});
				return Promise.resolve();
			});

			it('should have the type', () => {
				return expect(transferTransaction)
					.to.have.property('type')
					.equal(transactionType);
			});

			it('should have the amount', () => {
				return expect(transferTransaction)
					.to.have.property('amount')
					.equal(amount);
			});

			it('should have the fee', () => {
				return expect(transferTransaction)
					.to.have.property('fee')
					.equal(fee);
			});

			it('should have the recipient', () => {
				return expect(transferTransaction)
					.to.have.property('recipientId')
					.equal(recipientId);
			});

			it('should have the sender public key', () => {
				return expect(transferTransaction)
					.to.have.property('senderPublicKey')
					.equal(null);
			});

			it('should have the timestamp', () => {
				return expect(transferTransaction).to.have.property('timestamp');
			});

			it('should have the asset ', () => {
				return expect(transferTransaction).to.have.property('asset');
			});

			it('should not have the signature', () => {
				return expect(transferTransaction).not.to.have.property('signature');
			});

			it('should not have the id', () => {
				return expect(transferTransaction).not.to.have.property('id');
			});
		});
	});
});
