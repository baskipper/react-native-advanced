import React, {Component} from 'react';
import {
    View,
    Animated,
    PanResponder,
    Dimensions,
    LayoutAnimation,
    UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH / 4
const SWIPE_OUT_DURATION = 250

class Deck extends Component {

    static defaultProps = {
        onSwipeRight: () => {
        },
        onSwipeLeft: () => {
        },
        renderNoMoreCards: () => {

        }

    }

    constructor(props) {
        super(props)

        const position = new Animated.ValueXY()
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, {dx, dy}) => {
                position.setValue({x: dx, y: dy})
            },
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    this.forceSwipe(SCREEN_WIDTH)
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    this.forceSwipe(-SCREEN_WIDTH)
                } else {
                    this.resetPosition()
                }
            }
            ,
        });

        this.state = {panResponder, position, index: 0};
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps.data !== this.props.data)
        {
            this.setState(({index: 0}))
        }
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        UIManager.setLayoutAnimiationEnabledExperimental  && UIManager.setLayoutAnimiationEnabledExperimental(true);
        // animate any updates to the component
        LayoutAnimation.spring();
    }

    forceSwipe(x) {
        Animated.timing(this.state.position, {
            toValue: {x, y: 0},
            duration: SWIPE_OUT_DURATION
        }).start(() => {
            this.onSwipeComplete(x)
        })
    }

    onSwipeComplete(direction) {
        const {onSwipeLeft, onSwipeRight, data} = this.props
        const item = data[this.state.index]
        direction === SWIPE_THRESHOLD ? onSwipeRight(item) : onSwipeLeft(item)
        this.state.position.setValue({x: 0, y: 0})
        this.setState({index: this.state.index + 1})
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: {x: 0, y: 0}
        }).start()
    }

    getCardStyle() {
        const {position} = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-120deg', '0deg', '120deg']
        })

        return {
            ...position.getLayout(),
            transform: [{rotate}]
        }
    }

    renderCards() {
        const {index} = this.state
        const {data, renderNoMoreCards} = this.props
        const {cardStyle} = styles
        if (index >= data.length)
            return renderNoMoreCards()

        return this.props.data.map((item, i) => {
            if (i < index) {
                return null
            } else if (i === index) {
                return (
                    <Animated.View
                        key={item.id}
                        style={[this.getCardStyle(), cardStyle]}
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            } else {
                return (
                    <Animated.View key={item.id} style={[cardStyle, {top: 10 * (i - index)}]}>
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            }
        }).reverse()
    }

    render() {
        return (
            <View
            >
                {this.renderCards()}
            </View>
        )
    }
}

const styles = {
    cardStyle: {
        position: 'absolute',
        width: SCREEN_WIDTH
    }
}

export default Deck;