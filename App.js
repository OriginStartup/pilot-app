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
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useTheme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import Contacts from 'react-native-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-community/clipboard';

function Home({navigation}) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [instagram, setInstagram] = useState('');
  const [myContact, setMyContact] = useState({
    contact: {
      givenName: name,
      phoneNumbers: [
        {
          label: 'mobile',
          number: number,
        },
      ],
    },
    instagram: instagram,
  });

  // revisar quando usar o getData //
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
      contact: {
        givenName: name,
        phoneNumbers: [
          {
            label: 'mobile',
            number: number,
          },
        ],
      },
      instagram: instagram,
    });

    storeData(myContact);
    setName('');
    setNumber('');
    setInstagram('');

    navigation.navigate('Generator', {
      userName: myContact.contact.givenName,
      userNumber: myContact.contact.phoneNumbers[0].number,
      userInstagram: myContact.instagram,
    });
  };

  const seeData = async () => {
    console.log(await getData());
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View style={{marginBottom: 40}}>
        <Text style={{fontSize: 18, color: '#cecece', textAlign: 'center'}}>
          Preencha os dados do seu contato para compartlhar com as pessoas.
        </Text>
        <Text style={{fontSize: 12, color: '#cecece', textAlign: 'center'}}>
          Você só precisa preencher uma vez.
        </Text>
      </View>
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
      <TextInput
        style={styles.textInput}
        onChangeText={instagram => setInstagram(instagram)}
        value={instagram}
        placeholder="Digite seu instagram"
        placeholderTextColor={'#808080'}
      />
      <View style={{margin: 10}}>
        <TouchableOpacity style={styles.btn} onPress={saveMyContact}>
          <Text style={styles.textBold}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate('Generator', {
              userName: myContact.contact.givenName,
              userNumber: myContact.contact.phoneNumbers[0].number,
              userInstagram: myContact.instagram,
            })
          }>
          <Text style={styles.textBold}>Go to QRGenerator</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Scanner')}>
          <Text style={styles.textBold}>Go to QRScanner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function QrGenerator({route, navigation}) {
  const {userName, userNumber, userInstagram} = route.params;

  const [qrValue, setQrValue] = useState({
    contact: {
      givenName: userName,
      phoneNumbers: [
        {
          label: 'mobile',
          number: userNumber,
        },
      ],
    },
    instagram: userInstagram,
  });

  const generateQrCode = () => {
    console.log('gerar');
    setQrValue({
      contact: {
        givenName: userName,
        phoneNumbers: [
          {
            label: 'mobile',
            number: userNumber,
          },
        ],
      },
      instagram: userInstagram,
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.containerQr}>
        <QRCode
          value={JSON.stringify(qrValue)}
          size={250}
          color={'#7444d0'}
          backgroundColor="white"
        />
      </View>
      <View style={styles.containerBtn}>
        <Text style={styles.text}>{userName}</Text>
        <Text style={styles.text}>{userInstagram}</Text>
        <Text style={styles.text}>{userNumber}</Text>
        <TouchableOpacity style={styles.btn} onPress={generateQrCode}>
          <Text style={styles.textBold}>Gerar QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.textBold}>Go to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Scanner')}>
          <Text style={styles.textBold}>Go to QRScanner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.textBold}>Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function QrScanner() {
  const [qrContact, setQrContact] = useState({
    contact: {
      givenName: '',
      phoneNumbers: [
        {
          label: 'mobile',
          number: '',
        },
      ],
    },
    instagram: '',
  });

  const onRead = e => {
    const data = JSON.parse(e.data);
    setQrContact(data);
    console.log(data);
  };

  const saveContact = () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS, {
      title: 'Contacts',
      message: 'This app would like to view your contacts.',
      buttonPositive: 'Please accept bare mortal',
    })
      .then(
        Contacts.addContact(qrContact.contact),
        Linking.openURL(
          `whatsapp://send?text=Hello ${qrContact.contact.givenName}&phone=${qrContact.contact.phoneNumbers[0].number}`,
        ).catch(err => console.error('An error occured', err)),
      )
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <QRCodeScanner
            onRead={onRead}
            flashMode={RNCamera.Constants.FlashMode.off}
          />
        </View>
        {qrContact && (
          <View style={styles.footer}>
            <View style={{marginBottom: 20, marginTop: 20}}>
              <Text style={styles.text}>{qrContact.contact.givenName}</Text>
              <TouchableOpacity
                onPress={() => Clipboard.setString(`${qrContact.instagram}`)}>
                <Text style={styles.text}>{qrContact.instagram}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.btn} onPress={saveContact}>
              <Text style={styles.textBold}>Save contact</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

const App = () => {
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
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
    marginTop: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerBtn: {
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
    margin: 4,
    color: '#777',
  },
  textInput: {
    flexDirection: 'row',
    height: 40,
    minWidth: 300,
    marginLeft: 10,
    marginRight: 10,
    margin: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#7444d0',
    borderRadius: 8,
    color: '#fff',
  },
  centerText: {
    flex: 1,
    fontSize: 20,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  btn: {
    fontSize: 21,
    padding: 8,
    margin: 4,
    width: 140,
    borderRadius: 8,
    backgroundColor: '#7444d0',
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 18,
    padding: 32,
    color: '#777',
    marginTop: 38,
  },
});

export default App;
