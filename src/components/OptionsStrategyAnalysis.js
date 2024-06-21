import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { generateUnderlyingPrices, transformData } from "./Utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const sampleData = [
  {
    "strike_price": 100, 
    "type": "Call", 
    "bid": 10.05, 
    "ask": 12.04, 
    "long_short": "long", 
    "expiration_date": "2025-12-17T00:00:00Z"
  },
  {
    "strike_price": 102.50, 
    "type": "Call", 
    "bid": 12.10, 
    "ask": 14, 
    "long_short": "long", 
    "expiration_date": "2025-12-17T00:00:00Z"
  },
  {
    "strike_price": 103, 
    "type": "Put", 
    "bid": 14, 
    "ask": 15.50, 
    "long_short": "short", 
    "expiration_date": "2025-12-17T00:00:00Z"
  },
  {
    "strike_price": 105, 
    "type": "Put", 
    "bid": 16, 
    "ask": 18, 
    "long_short": "long", 
    "expiration_date": "2025-12-17T00:00:00Z"
  }
];

const OptionsStrategyAnalysis = () => {
  const [contracts, setContracts] = useState(transformData(sampleData));
  const underlyingPrices = useMemo(() => generateUnderlyingPrices(contracts), [contracts]);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    setContracts(prevContracts => {
      const newContracts = [...prevContracts];
      newContracts[index][name] = value;
      return newContracts;
    });
  };

  const calculateRiskRewardData = useMemo(() => {
    const data = underlyingPrices.map((price) => {
      let totalProfitLoss = 0;

      contracts.forEach((contract) => {
        if (
          contract.type &&
          contract.strikePrice &&
          contract.premium &&
          contract.quantity
        ) {
          const strike = parseFloat(contract.strikePrice);
          const premium = parseFloat(contract.premium);
          const quantity = parseInt(contract.quantity);
          const type = contract.type.toLowerCase().trim();

          // Simulated profit/loss calculation
          if (type === "call") {
            if (price > strike) {
              totalProfitLoss += (price - strike - premium) * quantity;
            } else {
              totalProfitLoss -= premium * quantity;
            }
          } else if (type === "put") {
            if (price < strike) {
              totalProfitLoss += (strike - price - premium) * quantity;
            } else {
              totalProfitLoss -= premium * quantity;
            }
          }
        }
      });

      return totalProfitLoss.toFixed(2);
    });

    return {
      labels: underlyingPrices,
      datasets: [
        {
          label: "Profit/Loss",
          data: data,
          backgroundColor: "blue",
        },
      ],
    };
  }, [contracts, underlyingPrices]);

  const calculateMaxProfit = useMemo(() => {
    const data = calculateRiskRewardData.datasets[0].data;
    const maxProfit = Math.max(...data);
    return maxProfit.toFixed(2);
  }, [calculateRiskRewardData]);

  const calculateMaxLoss = useMemo(() => {
    const data = calculateRiskRewardData.datasets[0].data;
    const maxLoss = Math.min(...data);
    return maxLoss.toFixed(2);
  }, [calculateRiskRewardData]);

  const calculateBreakEvenPoints = useMemo(() => {
    const data = calculateRiskRewardData.datasets[0].data;
    const breakEvenPoints = data.reduce((acc, value, index) => {
      if (parseFloat(value) <= 0) {
        acc.push(underlyingPrices[index]); // Assuming underlying prices increments by 10
      }
      return acc;
    }, []);
    return breakEvenPoints.join(", ");
  }, [calculateRiskRewardData, underlyingPrices]);

  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <h2>Options Strategy Risk & Reward Analysis</h2>

      <div>
        {contracts.map((contract, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <label>Contract {index + 1}</label>
            <div>
              <input
                type="text"
                name="type"
                value={contract.type}
                onChange={(e) => handleInputChange(index, e)}
                placeholder="Type (Call/Put)"
                style={{ marginRight: "10px" }}
              />
              <input
                type="text"
                name="strikePrice"
                value={contract.strikePrice}
                onChange={(e) => handleInputChange(index, e)}
                placeholder="Strike Price"
                style={{ marginRight: "10px" }}
              />
              <input
                type="text"
                name="premium"
                value={contract.premium}
                onChange={(e) => handleInputChange(index, e)}
                placeholder="Premium"
                style={{ marginRight: "10px" }}
              />
              <input
                type="text"
                name="quantity"
                value={contract.quantity}
                onChange={(e) => handleInputChange(index, e)}
                placeholder="Quantity"
                style={{ marginRight: "10px" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "20px" }}>
        <Line data={calculateRiskRewardData} />
      </div>
      <div style={{ marginTop: "20px" }}>
        <h3>Analysis Results</h3>
        <p>
          <strong>Max Profit:</strong> ${calculateMaxProfit}
        </p>
        <p>
          <strong>Max Loss:</strong> ${calculateMaxLoss}
        </p>
        <p>
          <strong>Break-Even Points:</strong> {calculateBreakEvenPoints}
        </p>
      </div>
    </div>
  );
};

export default OptionsStrategyAnalysis;
