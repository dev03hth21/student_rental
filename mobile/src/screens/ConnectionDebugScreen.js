import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { testConnection, getApiConfig } from '../services/connectionTest';

const ConnectionDebugScreen = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const config = getApiConfig();

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    
    const testResult = await testConnection();
    setResult(testResult);
    setTesting(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Connection Debug</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Platform:</Text>
          <Text style={styles.value}>{Platform.OS}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.label}>API Base URL:</Text>
          <Text style={styles.value}>{config.baseURL}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Timeout:</Text>
          <Text style={styles.value}>{config.timeout}ms</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, testing && styles.buttonDisabled]}
        onPress={runTest}
        disabled={testing}
      >
        {testing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Test Connection</Text>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Result</Text>
          <View
            style={[
              styles.resultBox,
              result.success ? styles.successBox : styles.errorBox,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                result.success ? styles.successText : styles.errorText,
              ]}
            >
              {result.success ? '✅ SUCCESS' : '❌ FAILED'}
            </Text>
            <Text style={styles.messageText}>{result.message}</Text>
            
            {result.data && (
              <View style={styles.dataBox}>
                <Text style={styles.dataLabel}>Data received:</Text>
                <Text style={styles.dataText}>
                  {JSON.stringify(result.data, null, 2)}
                </Text>
              </View>
            )}
            
            {result.error && (
              <View style={styles.dataBox}>
                <Text style={styles.dataLabel}>Error details:</Text>
                <Text style={styles.errorText}>
                  {typeof result.error === 'string'
                    ? result.error
                    : JSON.stringify(result.error, null, 2)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Troubleshooting</Text>
        <Text style={styles.troubleText}>
          • Ensure backend is running: npm start (in backend folder){'\n'}
          • Check backend port: Should be 5000{'\n'}
          • Android Emulator: Backend must bind to 0.0.0.0{'\n'}
          • Physical Device: Use computer's LAN IP (192.168.x.x){'\n'}
          • Check firewall: Allow port 5000{'\n'}
          • Same network: Phone and computer on same WiFi
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    width: 120,
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  button: {
    backgroundColor: '#2196F3',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultBox: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
  },
  successBox: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successText: {
    color: '#4caf50',
  },
  errorText: {
    color: '#f44336',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  dataBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  dataLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  dataText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#333',
  },
  troubleText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});

export default ConnectionDebugScreen;
