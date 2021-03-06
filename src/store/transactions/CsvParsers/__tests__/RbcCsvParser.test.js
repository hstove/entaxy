import parse from 'date-fns/parse'
import RbcCsvParser from '../RbcCsvParser'

const csvData = [
  'Account Type,Account Number,Transaction Date,Cheque Number,Description 1,Description 2,CAD$,USD$',
  'Chequing,nnnnn-nnnnnnn,6/25/2018,,Email Trfs,INTERAC E-TRF- 6319 ,20,',
  'Chequing,nnnnn-nnnnnnn,6/29/2018,,PAYROLL DEPOSIT,THE WORKING GRO ,2742.03,',
  'Savings,nnnnn-nnnnnnn,8/22/2018,,DEPOSIT,,,5300',
  'Visa,4514xxxxxxxxxxxx,8/13/2018,,LYFT *RIDE MON 11AM VANCOUVER BC,,-16.61,'
]

const expectedTransactions = [
  {
    accountId: 1,
    createdAt: parse('2018/06/25').getTime(),
    description: 'Email Trfs - Email Trfs',
    amount: 20
  },
  {
    accountId: 1,
    createdAt: parse('2018/06/29').getTime(),
    description: 'PAYROLL DEPOSIT - PAYROLL DEPOSIT',
    amount: 2742.03
  },
  {
    accountId: 1,
    createdAt: parse('2018/08/22').getTime(),
    description: 'DEPOSIT - DEPOSIT',
    amount: 5300
  },
  {
    accountId: 1,
    createdAt: parse('2018/08/13').getTime(),
    description: 'LYFT *RIDE MON 11AM VANCOUVER BC - LYFT *RIDE MON 11AM VANCOUVER BC',
    amount: -16.61
  }
]

describe('RBC CSV parser', () => {
  const account = {
    id: 1,
    currency: 'CAD'
  }
  describe('parse', () => {
    it('returns transactions', async () => {
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const { transactions, errors } = await new RbcCsvParser().parse(file, account)

      expect(transactions.length).toBe(csvData.length - 1)
      expect(errors.base.length).toBe(0)
      expect(Object.keys(errors.transactions).length).toBe(0)
      expect(transactions).toMatchObject(expectedTransactions)
      expect(transactions[0].id).not.toBeNull()
    })

    it('fails if the header doesn\'t match', async () => {
      const oldHeader = csvData[0]
      csvData[0] = 'something else'
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const { transactions, errors } = await new RbcCsvParser().parse(file, account)

      expect(transactions.length).toBe(0)
      expect(errors.base.length).toBe(csvData.length)
      expect(errors.base[0]).toBe(`Invalid header. Expected [${oldHeader}] but found [${csvData[0]}]`)
      expect(Object.keys(errors.transactions).length).toBe(0)
    })
  })
})
