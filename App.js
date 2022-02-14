/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Linking,
  PermissionsAndroid,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import QRCode from 'react-native-qrcode-svg';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import Contacts from 'react-native-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Home({navigation}) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [myContact, setMyContact] = useState({
    givenName: name,
    phoneNumbers: [
      {
        label: 'mobile',
        number: number,
      },
    ],
  });

  /* useEffect(() => {
    const getData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@storage_Key')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch(e) {
        // error reading value
    }
  }

  }); */

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@user_contact');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log('Error traying to get local data from storage.');
    }
  };

  const storeData = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('@user_contact', jsonValue);
    } catch (e) {
      console.log('Error traying to store data.');
    }
  };

  const saveMyContact = () => {
    setMyContact({
      givenName: name,
      phoneNumbers: [
        {
          label: 'mobile',
          number: number,
        },
      ],
    });
    storeData(myContact);
    setName('');
    setNumber('');
  };

  const seeData = async () => {
    console.log(await getData());
  };

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{fontSize: 18, color: 'black'}}>
        Preencha os dados do seu contato para compartlhar com as pessoas.
      </Text>
      <Text style={{fontSize: 12, color: 'black'}}>
        Você só precisa preencher uma vez.
      </Text>
      <TextInput
        style={styles.textInput}
        onChangeText={name => setName(name)}
        value={name}
        placeholder="Digite seu nome"
        placeholderTextColor={'#808080'}
      />
      <TextInput
        style={styles.textInput}
        onChangeText={number => setNumber(number)}
        value={number}
        placeholder="Digite seu numero"
        placeholderTextColor={'#808080'}
      />
      <View style={{margin: 10}}>
        <Button title="Salvar" onPress={saveMyContact} />
        {/* test to see storage data */}
        <Button title="Ver dados" onPress={seeData} />
        <Button
          title="Go to QRGenerator"
          onPress={() =>
            navigation.navigate('Generator', {
              userName: myContact.givenName,
              userNumber: myContact.phoneNumbers[0].number,
            })
          }
        />
      </View>
    </View>
  );
}

function QrGenerator({route, navigation}) {
  const {userName, userNumber} = route.params;
  const [qrValue, setQrValue] = useState({
    givenName: userName,
    phoneNumbers: [
      {
        label: 'mobile',
        number: userNumber,
      },
    ],
  });

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.containerQr}>
        <QRCode
          value={JSON.stringify(qrValue)}
          size={250}
          color={'black'}
          backgroundColor="white"
          logoSize={30}
          logoMargin={2}
          logoBorderRadius={15}
          logoBackgroundColor="yellow"
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.text}>{userName}</Text>
        <Text style={styles.text}>{userNumber}</Text>
        <View style={{margin: 10}}>
          <Button
            onPress={() =>
              setQrValue({
                givenName: userName,
                phoneNumbers: [
                  {
                    label: 'mobile',
                    number: userNumber,
                  },
                ],
              })
            }
            title="Gerar QR Code"
          />
          <Button
            title="Go to Home"
            onPress={() => navigation.navigate('Home')}
          />
          <Button
            title="Go to QRScanner"
            onPress={() => navigation.navigate('Scanner')}
          />
          <Button title="Go back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function QrScanner() {
  const [qrContact, setQrContact] = useState({
    givenName: '',
    phoneNumbers: [
      {
        label: 'mobile',
        number: '',
      },
    ],
  });

  const onSuccess = e => {
    Linking.openURL(e.data).catch(err =>
      console.error('An error occured', err),
    );
  };

  const onRead = e => {
    const data = JSON.parse(e.data);
    setQrContact(data);
    console.log(data);
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS, {
      title: 'Contacts',
      message: 'This app would like to view your contacts.',
      buttonPositive: 'Please accept bare mortal',
    })
      .then(
        Contacts.addContact(data),
        Linking.openURL(
          `whatsapp://send?text=Hello ${data.givenName}&phone=${data.phoneNumbers[0].number}`,
        ).catch(err => console.error('An error occured', err)),
      )
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <View>
      <QRCodeScanner
        onRead={onRead}
        flashMode={RNCamera.Constants.FlashMode.off}
        topContent={
          <Text style={styles.centerText}>
            Go to{' '}
            <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on
            your computer and scan the QR code.
          </Text>
        }
      />
      {qrContact && (
        <TouchableOpacity style={styles.buttonTouchable}>
          <Text style={styles.buttonText}>{qrContact.givenName}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const Stack = createNativeStackNavigator();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Generator" component={QrGenerator} />
        <Stack.Screen name="Scanner" component={QrScanner} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  containerQr: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 5,
    color: '#000',
  },
  textInput: {
    flexDirection: 'row',
    height: 40,
    minWidth: 300,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    margin: 10,
    borderWidth: 1,
    color: '#000',
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});

export default App;
