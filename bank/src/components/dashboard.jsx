import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  LogOut, 
  CreditCard, 
  TrendingUp, 
  BarChart2, 
  DollarSign 
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedNumbers, setAnimatedNumbers] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/dashboard/${username}`);
        console.log(response);
        if (response.data.success) {
          const fetchedData = response.data;
          setUserData(fetchedData);
          setLoading(false);

          const financialKeys = [
            'MonthlyIncome', 
            'MonthlyExpend', 
            'outstandingDebt', 
            'totalAssets'
          ];

          const animations = {};
          financialKeys.forEach(key => {
            const targetValue = fetchedData.financialInfo[key] || 0;
            animations[key] = { current: 0, target: targetValue };
          });
          setAnimatedNumbers(animations);

          const animationInterval = setInterval(() => {
            setAnimatedNumbers(prev => {
              const updated = {...prev};
              let animationComplete = true;
              Object.keys(updated).forEach(key => {
                const current = updated[key].current;
                const target = updated[key].target;
                if (Math.abs(target - current) > 0.1) {
                  updated[key].current = current + (target - current) * 0.1;
                  animationComplete = false;
                } else {
                  updated[key].current = target;
                }
              });
              if (animationComplete) clearInterval(animationInterval);
              return updated;
            });
          }, 50);

          return () => clearInterval(animationInterval);
        } else {
          console.error(response.data.message || 'Error fetching data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      }
    };

    fetchDashboardData();
  }, [username]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const renderLoanHistory = () => {
    if (!userData?.financialInfo?.loanHistory) {
      return <p className="text-white/60">No loan history available</p>;
    }

    const loanEntries = Object.entries(userData.financialInfo.loanHistory)
      .filter(([key]) => key.startsWith('L'))
      .sort(([a], [b]) => {
        const numA = parseInt(a.slice(1));
        const numB = parseInt(b.slice(1));
        return numA - numB;
      });

    if (loanEntries.length === 0) {
      return <p className="text-white/60">No loan history available</p>;
    }

    return (
      <div className="space-y-3">
        {loanEntries.map(([key, loan]) => (
          <motion.div 
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-white/30 transition-all backdrop-blur-lg"
          >
            <div className="grid grid-cols-2 gap-2">
              <p className="text-white/70">Loan Amount: ₹{loan.LoanAmount?.toLocaleString() || loan.loanAmount?.toLocaleString()}</p>
              <p className="text-white/70">Loan Type: {loan.LoanType || loan.loanType}</p>
              <p className="text-white/70">Start Date: {loan.startDate}</p>
              <p className="text-white/70">End Date: {loan.endDate}</p>
              <p className="text-white/70">Interest Rate: {loan.interestRate}%</p>
              <div className={`px-2 py-1 rounded-full text-center ${
                (loan.loanStatus || loan.status) === 'Pending' 
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : (loan.loanStatus || loan.status) === 'Paid'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                <p>Status: {loan.loanStatus || loan.status}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderFinancialInfo = () => {
    if (!userData) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-lg p-6 rounded-xl space-y-4 border border-white/10"
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { 
              icon: <DollarSign className="text-emerald-400" />, 
              label: 'Monthly Income', 
              value: animatedNumbers.MonthlyIncome,
              color: 'emerald'
            },
            { 
              icon: <TrendingUp className="text-blue-400" />, 
              label: 'Monthly Expenditure', 
              value: animatedNumbers.MonthlyExpend,
              color: 'blue'
            },
            { 
              icon: <CreditCard className="text-teal-400" />, 
              label: 'Outstanding Debt', 
              value: animatedNumbers.outstandingDebt,
              color: 'teal'
            },
            { 
              icon: <BarChart2 className="text-green-400" />, 
              label: 'Total Assets', 
              value: animatedNumbers.totalAssets,
              color: 'green'
            }
          ].map(({ icon, label, value, color }) => (
            <motion.div 
              key={label}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center space-x-3 bg-${color}-500/10 p-4 rounded-lg border border-${color}-500/30 hover:border-${color}-500/50 transition-all backdrop-blur-lg`}
            >
              {icon}
              <div>
                <p className="text-sm text-white/60">{label}</p>
                <p className="text-xl font-bold text-white">
                  ₹{Math.round(value?.current || 0).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-4 rounded-xl text-center shadow-lg backdrop-blur-lg"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-xl font-semibold text-white/80">Credit Score</h3>
          <p className="text-4xl font-extrabold mt-2 text-white">
            {userData.cibilScore}
          </p>
        </motion.div>

        <motion.div 
          className="bg-white/5 backdrop-blur-lg p-4 rounded-xl border border-white/10 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="text-lg font-bold text-white/80">Loan History</h4>
          {renderLoanHistory()}
        </motion.div>
      </motion.div>
    );
  };

  const renderLoanOffers = () => {
    if (!userData || !userData.loanOffers.length) return (
      <p className="text-white/70 text-center">No loan offers available</p>
    );

    return (
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 max-h-[calc(100vh-150px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent"
      >
        {userData.loanOffers.map((offer, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.03 }}
            className="bg-white/5 backdrop-blur-lg p-5 rounded-xl border border-white/10 hover:border-blue-400 transition-all"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold text-blue-300">{offer.bankName}</h4>
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                {offer.loan_type}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-white/70">
              <p>Interest Rate: {offer.interest_rate}%</p>
              <p>Loan Range: ₹{offer.min_loan_amount.toLocaleString()} - ₹{offer.max_loan_amount.toLocaleString()}</p>
              <p>Term: {offer.term.min_years}-{offer.term.max_years} years</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden relative">
        <div className="fixed inset-0 transition-colors duration-500 animate-gradient bg-gradient-to-br from-emerald-900 via-blue-800 to-emerald-900" 
          style={{
            animation: `gradientAnimation 15s ease infinite`,
            backgroundSize: '400% 400%',
            WebkitAnimation: `gradientAnimation 15s ease infinite`
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-t-4 border-white/50 rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 transition-colors duration-500 animate-gradient bg-gradient-to-br from-emerald-900 via-blue-800 to-emerald-500" 
        style={{
          animation: `gradientAnimation 15s ease infinite`,
          backgroundSize: '400% 400%',
          WebkitAnimation: `gradientAnimation 15s ease infinite`
        }}
      />
      
      <style jsx>{`
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <div className="relative z-10 p-8">
        <motion.div 
          className="w-full max-w-6xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-2 gap-6 p-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Welcome, {username}</h1>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
            {renderFinancialInfo()}
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Loan Offers</h2>
            {renderLoanOffers()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;