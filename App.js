//Leonardo Meliande
//24/09/2019 às 13:54

import React, { Component } from 'react';
import * as Font from 'expo-font';
import { StyleSheet, TouchableHighlight, FlatList, ActivityIndicator, Alert, Keyboard, TextInput } from 'react-native';
import { Container, Header, Body, Title, Button, View, Content, Tab, Tabs, 
  TabHeading, Text, Icon, Picker, Form, Item, Input, Label } from 'native-base';

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      isReady: false,
      refreshing: false,
      dataSource: [],
      viewSource: [], 
      nome: "", 
      comentario: "",
      platafornma: "PlayStation 4",
     };
  }

  // Carregado fontes antes do render inicial
  async componentWillMount() {
    await Expo.Font.loadAsync({
      'Roboto': require("./node_modules/native-base/Fonts/Roboto.ttf"),
      'Roboto_medium': require("./node_modules/native-base/Fonts/Roboto_medium.ttf"),
    });
    this.setState({ isReady: true });
  }

  // Função responsável por buscar informações da API
  async carregar() { 
    
    await fetch("https://review-jogos.herokuapp.com/reviews")
      .then(response => response.json())
    .then((responseJson)=> {
      this.setState({
        loading: false,
        dataSource: responseJson,
        viewSource: responseJson, 
      })

      this.arrayholder = responseJson;  
    })
    .catch(error=>console.log(error))
  }

  // Função responsável por guardar informações da API
  async cadastrar() {
    
    var url = "https://review-jogos.herokuapp.com/reviews";
    
    var data = {
      nome: this.state.nome,
      comentario: this.state.comentario,
      plataforma: this.state.plataforma,
    };
    
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
    .then(Alert.alert('Sucesso','Comentário publicado com sucesso!',))
    
    .catch(error => console.error('Error:', error));
    
    // Torna os campos vazios para serem inseridos novas informações
    this.setState({
      nome: "", 
      comentario: ""
    })

    Keyboard.dismiss() // Guardar o teclado do sistema após as informações serem armazenadas

  }

  // Carregado após o render inicial
  componentDidMount() {
    this.carregar();
  }

  // Separador dos itens da flatlist
  FlatListItemSeparator = () => {
    return (
      <View style={{
        height: .35,
        width:"100%",
        backgroundColor: "#4a2989",
    }}
      />
    );
  }

  // Recarregar a lista 
  _onRefresh() {
    this.setState({refreshing: true})
    this.carregar().then(() => {
      this.setState({refreshing: false})
    });
  }

  // Receber valor escolhido no picker
  onValueChange(value) {
    this.setState({
      plataforma: value
    });
  }

  // Itens que serão exibidos na lista
  renderItem = data => (

  <TouchableHighlight style={styles.list}>
    <View style={styles.list}>
      <Text style={styles.lightText}>Nome do jogo: {data.item.nome}</Text>
      <Text style={styles.lightText}>Comentário: {data.item.comentario}</Text>
      <Text style={styles.lightText}>Plataforma: {data.item.plataforma}</Text>
      <View style={{flexDirection:"row"}}>
        <Icon 
          type="FontAwesome" 
          name='heart'
          style={{fontSize: 20, 
            color: data.item.curtido ? '#99073e' : 'grey',
            paddingLeft: 15, 
            margin: 10, 
            marginTop: 10}}
          onPress={() => this.curtido(data)}
          /> 
        <Text style={styles.lightText}>{data.item.qtdcurtido}</Text>
      </View>
    </View>
  </TouchableHighlight>
  
  )

  // Função para controlar os likes e sua contagem em cada item
  curtido = async data => {

    if (data.item.qtdcurtido === 0) {
      data.item.curtido = !data.item.curtido;
      data.item.qtdcurtido = data.item.qtdcurtido + 1;
    } else if (data.item.qtdcurtido > 0) {
      data.item.qtdcurtido = data.item.qtdcurtido + 1;
    }
  
    var url = "https://review-jogos.herokuapp.com/reviews";

    var atualizado = {
      _id: data.item._id,
      nome: data.item.nome,
      comentario: data.item.comentario,
      plataforma: data.item.plataforma,
      curtido: data.item.curtido,
      qtdcurtido: data.item.qtdcurtido,
    };

    var id = data.item._id;

    const index = this.state.dataSource.findIndex(
      item => data.item._id === item._id
    );

    this.state.dataSource[index] = atualizado;
  
    try { // atualizando nova informação no item dentro do JSON na API
      const response = await fetch(url + '/' + id, {
        method: 'PUT', // or 'PUT'
        body: JSON.stringify(atualizado),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
    } catch (error) {
      console.error('Erro:', error);
    }

    this.setState({
      dataSource: this.state.dataSource, // atualizando informação na lista
    });

  }; 
  
  // Função responsável pelo filtro do mecanismo de busca
  setSearchText(event) {

    const searchText = event.nativeEvent.text;    

    const filteredTexts = this.state.dataSource.filter(row => {

    // Não aplicar filtro quanod não houver texto na caixa de busca
    if(!searchText) {
        return true;
    }
    
    return (typeof row.nome === 'string') &&
      row.nome.includes(searchText) 
    });

    this.setState({ 
        searchText,
        // Atualiza para exibir apenas a informação filtrada
        viewSource: filteredTexts
    });
  }

  // Render das telas principais do sistema
  render(){
    
    if(this.state.loading){
      return( 
        <View style={styles.loader}> 
          <ActivityIndicator size="large" color="#0c9"/>
        </View>
    )}

    return(
    <Container>

      <Header androidStatusBarColor="#2c1754" style={styles.header} hasTabs>
        <Body>
          <Title style={styles.title}>Reviews de jogos</Title>
        </Body>
      </Header>

      <View style={styles.container}>

        <Tabs>

        <Tab heading={<TabHeading style={styles.tabHeading} ><Icon type="FontAwesome" name="list" /></TabHeading>}>
          
          <View> 
            <TextInput
              style={styles.textInputStyle}
              placeholder="Pesquisar jogo"
              value={this.state.searchText}
              onChange={this.setSearchText.bind(this)}
              underlineColorAndroid="transparent"
            />
          </View>

          <FlatList
              data= {this.state.viewSource}
              extraData= {this.state}
              ItemSeparatorComponent = {this.FlatListItemSeparator}
              renderItem= { item => this.renderItem(item)}
              keyExtractor={(item, index) => String(index)}
              refreshing = {this.state.refreshing}
              onRefresh = {this._onRefresh.bind(this)}
            />
        </Tab>

        <Tab heading={<TabHeading style={styles.tabHeading} ><Icon type="FontAwesome" name="plus-square" /></TabHeading>}>
          <Content>
            <Form style={{ margin: 5 }}>
              <Item stackedLabel>
                <Label style={{ color: "black"}}>Nome do jogo:</Label>
                <Input
                  onChangeText={(nome) => this.setState({nome})}
                  value={this.state.nome}
                />
              </Item>
              <Item stackedLabel last>
                <Label style={{ color: "black"}}>Comentário:</Label>
                <Input
                  onChangeText={(comentario) => this.setState({comentario})}
                  value={this.state.comentario}
                />
              </Item>
              <View style={[{marginLeft: 15}, {marginTop: 20}]}> 
                <Label style={{ fontSize: 15 }}>Plataforma:</Label>
                <Picker
                  note
                  mode="dropdown"
                  style={[{ width: 160 }, {marginTop: 15}]}
                  selectedValue={this.state.plataforma}
                  onValueChange={this.onValueChange.bind(this)}
                >
                  
                  <Picker.Item label="PlayStation 4" value="PlayStation 4"/>
                  <Picker.Item label="Xbox One" value="Xbox One"/>
                  <Picker.Item label="Nintendo Switch" value="Nintendo Switch"/>
                  <Picker.Item label="PC" value="PC"/>

                </Picker>
              </View>
            </Form>
          </Content>
          <Button rounded style={styles.button} onPress={() => {

            if (this.state.nome != '') {
              // Checa se o campo do nome está preenchido
              if (this.state.comentario != '') {
                // Checa se o campo do comentário está preenchido
                this.cadastrar()
              } else {
                Alert.alert('Erro','Favor inserir um comentário para o jogo!',)
              }
            } else {
              Alert.alert('Erro','Favor inserir um nome para o jogo!',)
            }
          }}>
            <Text>Publicar</Text>
          </Button>
        </Tab>

        <Tab heading={<TabHeading style={styles.tabHeading} ><Icon type="FontAwesome" name="question-circle" /></TabHeading>}>
          <Text style={styles.lightText}>
            Esta é uma simples aplicação web para armazenar comentários e reviews sobre jogos diversos e suas plataformas.
          </Text>
          <Text style={[{textAlign: "center"}, {marginTop:20}]}> 
            <Text style={styles.lightText}>
              Autor: Leonardo Meliande
            </Text>
          </Text>
        </Tab>

      </Tabs>
      
    </View>
    </Container>
  )}
}

  const styles = StyleSheet.create({
    lightText: {
      paddingVertical: 5,
      paddingLeft: 10,
      paddingRight: 10,
      margin: 5,
      fontSize: 15,
    },
    textInputStyle: {
      height: 55,
      borderBottomWidth: 1,
      paddingLeft: 30,
      fontSize: 15,
      borderColor: '#4a2989',
      backgroundColor: '#FFFFFF',
    },
    title: {
      marginLeft: 10,
      fontSize: 17,
    },
    button: {
      position: 'absolute',
      bottom:10,
      right:10,
      backgroundColor: "#4a2989",
    },
    container: {
      flex: 1,
    },
    loader: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff"
    },
    list: {
      margin: 5,
      backgroundColor: "#fff"
    },
    header: { 
      backgroundColor: "#4a2989",
    },
    tabHeading: {
      backgroundColor: "#4a2989",
    },
  });
