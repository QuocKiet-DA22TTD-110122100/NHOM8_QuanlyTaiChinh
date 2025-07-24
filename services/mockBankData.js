const mockBankTransactions = [
  {
    id: 'TXN001',
    accountNumber: '1234567890',
    bankName: 'Vietcombank',
    amount: 5000000,
    type: 'credit', // credit = tiền vào, debit = tiền ra
    description: 'Luong thang 12/2024',
    transactionDate: new Date('2024-12-15'),
    balance: 15000000,
    reference: 'SAL202412001'
  },
  {
    id: 'TXN002', 
    accountNumber: '1234567890',
    bankName: 'Vietcombank',
    amount: 500000,
    type: 'debit',
    description: 'Rut tien ATM',
    transactionDate: new Date('2024-12-14'),
    balance: 10000000,
    reference: 'ATM202412002'
  },
  {
    id: 'TXN003',
    accountNumber: '1234567890', 
    bankName: 'Vietcombank',
    amount: 2000000,
    type: 'debit',
    description: 'Chuyen khoan mua hang online',
    transactionDate: new Date('2024-12-13'),
    balance: 10500000,
    reference: 'TRF202412003'
  }
];

class MockBankService {
  static getAllTransactions(accountNumber, fromDate, toDate) {
    let transactions = mockBankTransactions.filter(t => 
      t.accountNumber === accountNumber
    );

    if (fromDate) {
      transactions = transactions.filter(t => 
        new Date(t.transactionDate) >= new Date(fromDate)
      );
    }

    if (toDate) {
      transactions = transactions.filter(t => 
        new Date(t.transactionDate) <= new Date(toDate)
      );
    }

    return transactions.sort((a, b) => 
      new Date(b.transactionDate) - new Date(a.transactionDate)
    );
  }

  static getAccountBalance(accountNumber) {
    const latestTransaction = mockBankTransactions
      .filter(t => t.accountNumber === accountNumber)
      .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))[0];
    
    return latestTransaction ? latestTransaction.balance : 0;
  }
}

module.exports = MockBankService;