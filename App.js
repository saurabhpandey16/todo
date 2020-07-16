import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  FlatList,
  AsyncStorage,
  Button,
  TextInput,
  Keyboard,
  Platform,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import TimePicker from 'react-native-simple-time-picker';
const isAndroid = Platform.OS == 'android';
const viewPadding = 10;

export default class TodoList extends Component {
  state = {
    tasks: [],
    text: '',
    modalVisible: false,
    selectedHours: 0,
    selectedMinutes: 0,
    randomColors: ['red', 'blue', 'green'],
  };

  changeTextHandler = text => {
    this.setState({text: text});
  };

  addTask = () => {
    let notEmpty = this.state.text.trim().length > 0;
    let time = this.state.selectedHours + ':' + this.state.selectedMinutes;
    if (notEmpty) {
      this.setState(
        prevState => {
          let {tasks, text} = prevState;
          return {
            tasks: tasks.concat({key: tasks.length, text: text, time: time}),
            text: '',
          };
        },
        () => Tasks.save(this.state.tasks),
      );
    }
  };

  deleteTask = i => {
    this.setState(
      prevState => {
        let tasks = prevState.tasks.slice();

        tasks.splice(i, 1);

        return {tasks: tasks};
      },
      () => Tasks.save(this.state.tasks),
    );
  };

  componentDidMount() {
    Keyboard.addListener(
      isAndroid ? 'keyboardDidShow' : 'keyboardWillShow',
      e => this.setState({viewPadding: e.endCoordinates.height + viewPadding}),
    );

    Keyboard.addListener(
      isAndroid ? 'keyboardDidHide' : 'keyboardWillHide',
      () => this.setState({viewPadding: viewPadding}),
    );

    Tasks.all(tasks => this.setState({tasks: tasks || []}));
  }
  modalClose = () => {
    this.setState({modalVisible: false});
  };

  modalOpen = () => {
    this.setState({modalVisible: true});
  };

  render() {
    const {modalVisible, selectedHours, selectedMinutes} = this.state;
    return (
      <SafeAreaView
        style={[styles.container, {paddingBottom: this.state.viewPadding}]}>
        <FlatList
          style={styles.list}
          data={this.state.tasks}
          renderItem={({item, index}) => (
            <View>
              <View style={styles.listItemCont}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 30,
                    backgroundColor: this.state.randomColors[index % 3],
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{textAlign: 'center', fontSize: 18, color: 'white'}}>
                    {item.text.substr(0, 1)}
                  </Text>
                </View>
                <Text style={styles.listItem}>{item.text}</Text>
                <Text style={styles.listItem}>{item.time}</Text>

                <Button title="X" onPress={() => this.deleteTask(index)} />
              </View>
              <View style={styles.hr} />
            </View>
          )}
        />

        <Modal
          style={{backgroundColor: 'yellow', marginTop: 100}}
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            this.modalClose();
          }}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.textInput}
              onChangeText={this.changeTextHandler}
              onSubmitEditing={this.addTask}
              value={this.state.text}
              placeholder="Add Tasks"
              returnKeyType="done"
              returnKeyLabel="done"
            />
            <Text>
              {selectedHours}:{selectedMinutes}
            </Text>
            <TimePicker
              style={{flex: 1}}
              selectedHours={selectedHours}
              selectedMinutes={selectedMinutes}
              onChange={(hours, minutes) =>
                this.setState({
                  selectedHours: hours,
                  selectedMinutes: minutes,
                })
              }
            />

            <TouchableOpacity
              onPress={() => {
                this.addTask();
                this.modalClose();
              }}>
              <Text>SAVE</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <TouchableOpacity
          style={styles.TouchableOpacityStyle}
          activeOpacity={0.7}
          onPress={() => {
            this.modalOpen();
          }}>
          <Text style={{textAlign: 'center', fontSize: 30, color: 'white'}}>
            +
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

let Tasks = {
  convertToArrayOfObject(tasks, callback) {
    return callback(
      tasks ? tasks.split('||').map((task, i) => ({key: i, text: task})) : [],
    );
  },
  convertToStringWithSeparators(tasks) {
    return tasks.map(task => task.text).join('||');
  },
  all(callback) {
    return AsyncStorage.getItem('TASKS', (err, tasks) =>
      this.convertToArrayOfObject(tasks, callback),
    );
  },
  save(tasks) {
    debugger;

    AsyncStorage.setItem('TASKS', this.convertToStringWithSeparators(tasks));
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: viewPadding,
    paddingTop: 20,
  },
  list: {
    width: '100%',
  },
  listItem: {
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: 18,
  },
  hr: {
    height: 1,
    backgroundColor: 'gray',
  },
  listItemCont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  FloatingButtonStyle: {
    textAlign: 'center',
  },
  textInput: {
    height: 40,
    paddingRight: 10,
    paddingLeft: 10,
    borderColor: 'gray',
    borderWidth: isAndroid ? 0 : 1,
    width: '100%',
  },
  TouchableOpacityStyle: {
    backgroundColor: 'blue',
    width: 50,
    height: 50,
    alignItems: 'center',
    borderRadius: 30,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    margin: 20,
  },
  modalView: {
    margin: 20,
    marginTop: 100,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

AppRegistry.registerComponent('TodoList', () => TodoList);
