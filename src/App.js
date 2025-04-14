import React, { useState } from 'react';
import { Layout, Upload, Button, message, Spin, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import PalletVisualizer from './components/PalletVisualization';

const { Header, Content } = Layout;
const { Option } = Select;

function App() {
  const [pallets, setPallets] = useState([]);
  const [selectedPalletIndex, setSelectedPalletIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Функция загрузки CSV‑файла и отправки его на backend
  const handleFileUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('order_file', file);

    try {
      const response = await axios.post('http://localhost:8000/palletize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPallets(response.data);
      message.success('Файл успешно загружен и обработан');
    } catch (error) {
      message.error(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePalletChange = (value) => {
    setSelectedPalletIndex(Number(value));
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 20px' }}>
        <div style={{ color: 'white', fontSize: '24px' }}>
          Паллетизация товаров
        </div>
      </Header>
      <Content style={{ padding: '20px', background: '#fff' }}>
        {(!pallets.length && !loading) ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Upload
              accept=".csv"
              beforeUpload={(file) => {
                handleFileUpload(file);
                return false; // Предотвращаем автоматическую отправку
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} size="large">
                Загрузить CSV файл
              </Button>
            </Upload>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '20px' }}>Загрузка данных...</div>
          </div>
        ) : (
          <div>
            {pallets.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <Select defaultValue={0} style={{ width: 200 }} onChange={handlePalletChange}>
                  {pallets.map((p, index) => (
                    <Option key={index} value={index}>
                      Паллет {p.pallet_index}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
            <PalletVisualizer pallets={pallets} selectedPalletIndex={selectedPalletIndex} />
          </div>
        )}
      </Content>
    </Layout>
  );
}

export default App;
