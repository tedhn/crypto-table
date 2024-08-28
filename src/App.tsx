import { IconChevronDown } from "@tabler/icons-react";
import {
  Button,
  Dropdown,
  Input,
  MenuProps,
  Space,
  Table,
  TableProps,
} from "antd";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Line, LineChart, YAxis } from "recharts";

const currencyItems: MenuProps["items"] = [
  { key: "USD $", label: "USD" },
  { key: "EUR €", label: "EUR" },
];

const sortOrderItems: MenuProps["items"] = [
  { key: "market_cap_desc", label: "Market Cap Decending" },
  { key: "market_cap_asc", label: "Market Cap Ascending" },
];

interface CoinType {
  name: string;
  image: string;
  current_price: number;
  circulating_supply: number;
  sparkline_in_7d: {
    price: Array<number>;
  };
}

function App() {
  const [currency, setCurrency] = useState({ label: "USD", symbol: "$" });
  const [sortOrder, setSortOrder] = useState({
    label: "Market Cap Decending",
    key: "market_cap_desc",
  });

  const [pagination, setPagination] = useState({
    totalCount: 10000,
    pageSize: 10,
    current: 1,
  });

  const [data, setData] = useState<Array<CoinType>>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Array<CoinType>>([]);

  const [isLoading, setIsLoading] = useState(false);

  // reruns everytime pagination, currency or sortOrder changes to fetch new data
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.label.toLowerCase()}&order=${sortOrder.key.toLowerCase()}&per_page=${
            pagination.pageSize
          }&page=${pagination.current}&sparkline=true`
        );

        setData(data);
      } catch (e) {
        toast.error("Failed to fetch data, try again later");
      }
      setIsLoading(false);
    })();
  }, [currency, sortOrder, pagination]);

  useEffect(() => {
    if (filterQuery) {
      const filtered = data.filter((coin) =>
        coin.name.toLowerCase().includes(filterQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [filterQuery, data]);

  //handles currency dropdown change
  const handleCurrencyChange: MenuProps["onClick"] = (e) => {
    const [label, symbol] = e.key.split(" ");
    setPagination({ ...pagination, current: 1 });
    setCurrency({ label, symbol });
  };

  // handles sort order dropdown
  const handleSortOrder: MenuProps["onClick"] = (e) => {
    switch (e.key) {
      case "market_cap_desc":
        setPagination({ ...pagination, current: 1 });
        setSortOrder({ label: "Market Cap Decending", key: "market_cap_desc" });
        break;
      case "market_cap_asc":
        setPagination({ ...pagination, current: 1 });
        setSortOrder({ label: "Market Cap Ascending", key: "market_cap_asc" });
        break;
    }
  };

  // columns data for the table rerenders if the data changes
  const columns: TableProps<CoinType>["columns"] = useMemo(() => {
    return [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <div className="flex justify-start items-center gap-2">
            <img src={record.image} className="size-8" />
            {text}
          </div>
        ),
        width: "30%",
      },
      {
        title: "Current Price",
        dataIndex: "current_price",
        key: "current_price",
        render: (text) => (
          <a>
            {currency.symbol}
            {text}
          </a>
        ),
        width: "30%",
        filters: [
          {
            text: "0 - 100",
            value: "0 - 100",
          },
          {
            text: "100 - 200",
            value: "100 - 200",
          },
          {
            text: "200 - 300",
            value: "200 - 300",
          },
          {
            text: "300 - 400",
            value: "300 - 400",
          },
          {
            text: "400 - 500",
            value: "400 - 500",
          },
          {
            text: "500 - 600",
            value: "500 - 600",
          },
          {
            text: "600 - 700",
            value: "600 - 700",
          },
          {
            text: "> 700",
            value: "700",
          },
        ],
        sorter: (a, b) => a.current_price - b.current_price,
        sortDirections: ["descend", "ascend"],
        onFilter: (value, record) => {
          const newValue = value as string;
          const [min, max] = newValue.split(" - ");

          // If there's no max value, handle the "greater than" case
          if (!max) {
            return record.current_price >= Number(min);
          }

          // Handle normal range filtering
          return (
            record.current_price >= Number(min) &&
            record.current_price <= Number(max)
          );
        },
        filterSearch: true,
      },
      {
        title: "Circulating Supply",
        dataIndex: "circulating_supply",
        key: "circulating_supply",
        render: (text) => <a>{text}</a>,
        width: "30%",
      },
      {
        title: "Price Change ( 7 Days )",
        width: "10%",
        render: (_, record) => (
          <LineChart
            width={200}
            height={40}
            data={record.sparkline_in_7d.price.map((price) => ({
              price,
            }))}
          >
            <YAxis domain={["auto", "auto"]} hide />

            {/* red color graph for downward trend & green for upward trend since 1st day vs last day */}
            <Line
              dataKey="price"
              stroke={
                record.sparkline_in_7d.price[0] >
                record.sparkline_in_7d.price[
                  record.sparkline_in_7d.price.length - 1
                ]
                  ? "#d61616"
                  : "#19db39"
              }
              dot={false}
              xAxisId={1000}
            />
          </LineChart>
        ),
      },
    ];
  }, [data]);

  return (
    <section className="p-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <Toaster />
      <h1 className="mb-8 text-2xl font-bold">Coins & Markets</h1>

      <section className="flex justify-start items-center gap-4 my-8">
        <Dropdown
          menu={{
            items: currencyItems,
            onClick: handleCurrencyChange,
            selectable: true,
            selectedKeys: [currency.label + " " + currency.symbol],
          }}
          trigger={["click"]}
        >
          <Button>
            {currency.label}

            <IconChevronDown />
          </Button>
        </Dropdown>

        <Dropdown
          menu={{
            items: sortOrderItems,
            onClick: handleSortOrder,
            selectable: true,
            selectedKeys: [sortOrder.key],
          }}
          trigger={["click"]}
        >
          <Button>
            <Space>
              {sortOrder.label}
              <IconChevronDown />
            </Space>
          </Button>
        </Dropdown>
      </section>

      <form className="my-2 flex justify-between items-center gap-2">
        <Input
          placeholder="Search Coins..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
      </form>

      <Table
        columns={columns}
        dataSource={filterQuery ? filteredData : data}
        loading={isLoading}
        pagination={{
          total: pagination.totalCount,
          pageSize: pagination.pageSize,
          current: pagination.current,
          onChange: (current, size) => {
            setPagination({ ...pagination, current, pageSize: size });
          },
        }}
        showSorterTooltip={false}
      />
    </section>
  );
}

export default App;
