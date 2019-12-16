<!--- begin-section title="Cookbook: Various visualizations and how to build them" -->

<!--- begin-lecture title="Intro to cookbook area" -->

👋 this section started as a month-long series of almost daily data
visualizations. Originally structured as a challenge+solution, I warmly
recommend you approach it that way as well.

Look at each section, get the data, try to build it yourself. Then look at my
solution. Each comes with a recording of a livestream I did while figuring out
how to solve the problem :)

<!--- end-lecture -->

<!--- begin-lecture title="Christmas trees sold in USA - an emoji barchart" -->

# Challenge

Every year americans buy a bunch of christmas trees. Use the dataset to compare
real and fake sales with two bar charts.

[Dataset](https://reactviz.holiday/datasets/statistic_id209249_christmas-trees-sold-in-the-united-states-2004-2017.xlsx)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/Blyq4m0CvxY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/p9p89w86wx?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Christmas trees sold in USA is an example of a simple barchart built with React
and D3. More React than D3 really. 😇

We used the simplified full integration approach because the data never
changes. Neither do any of the other props like `width` and `height`. Means we
don't have to worry about updating D3's internal state. Plopping D3 stuff into
class field properties works great.

We converted our dataset from xlsx into a tab separated values file. Easy copy
paste job with this tiny dataset. That goes in `/public/data.tsv`.

To load the dataset we use `d3.tsv` inside `componentDidMount`.

```javascript
  componentDidMount() {
    d3.tsv("/data.tsv", ({ year, real_trees, fake_trees }) => ({
      year: Number(year),
      real_trees: Number(real_trees),
      fake_trees: Number(fake_trees)
    })).then(data => this.setState({ data }));
  }
```

When the `<App>` component first loads, it makes a `fetch()` request for our
data file. D3 parses the file as a list of tab separated values and passes each
line through our data parsing function. That turns it into a nicely formatted
object with real numbers.

`.then` we update component state with our data.

Inside the render method we use a conditional. When data is present, we render
a `<Barchart>` component with a title. When there's no data, we render nothing.

No need for a loading screen with a dataset this small. Loads and parses super
fast. 👌

### Render the emoji barchart

![Switchable emoji christmas tree barchart](https://github.com/Swizec/datavizAdvent/raw/master/src/content/christmas-trees/christmastrees.gif)

We created a `<Barchart>` component that takes:

- `data`, our entire dataset
- `value`, the key name we're displaying
- `y`, the vertical position

Final version doesn't need that vertical positioning param, but it's nice to
have. You never know.

The `Barchart` uses a horizontal `scaleBand` to handle each column's
positioning. Scale bands are a type of ordinal scale. They automatically handle
spacing, padding, and making sure our columns neatly fit into a given width.

There's no height axis because we want each christmas tree emoji 🎄 to
represent a million real life trees.

We loop over the data and render a `TreeBar` and a `text` label for each entry.

```javascript
<g transform={`translate(0, ${y})`}>
  {data.map(d => (
    <React.Fragment>
      <TreeBar x={this.xScale(d.year)} y={480} count={d[this.props.value]} />
      <text
        x={this.xScale(d.year)}
        y={500}
        style={{ strike: 'black', fontSize: '12px' }}
        textAnchor="center"
      >
        {d.year}
      </text>
    </React.Fragment>
  ))}
</g>
```

A grouping element holds everything in place and creates a common coordinate
system to work off of. It's like a div. We position it with a
`transform=translate` and elements inside position relatively to the group.

For each iteration of our `data`, we render a `<TreeBar>` and a `<text>`. Text
goes at the bottom and displays the year. That's our label.

`<TreeBar>` gets a horizontal position through our `xScale`, a vertical
position which is static, and a `count` of how many trees 🎄 to show. We use
`this.props.value` to dynamically fetch the correct part of each data object.

### A <TreeBar> of emojis 🎄

Now here's a silly little fun part: Instead of an SVG rectangle, we build each
bar from a bunch of emoji text elements.

```javascript
const TreeBar = ({ x, y, count }) => (
  <g transform={`translate(${x}, ${y})`}>
    {d3.range(count).map(i => (
      <text x={0} y={-i * 12} style={{ fontSize: '20px' }}>
        🎄
      </text>
    ))}
    <text
      x={0}
      y={-(count + 1) * 12 - 5}
      style={{ fontSize: '9px' }}
      textAnchor="center"
    >
      {count}
    </text>
  </g>
);
```

Once more we start with a grouping element. That holds everything together.

Then we create a fake array with `d3.range` and iterate. For each index in the
array, we return a text element positioned at a `12px` offset from the previous
element, a `fontSize` of `20px`, and a christmas tree emoji for content.

We found the values through experiment. Keeping emojis spaced to their full
height created bars that were too hard to read. An overlap works great. Keeps
the bars readable and the emojis recognizable.

That final little text shows how many million trees we drew in each bar. Makes
our chart easier to read than counting tres :)

### What you learned 🧐

Today you learned:

- D3 band scales
- D3 range for creating iteration arrays
- using class field values for D3 objects
- a simple full integration approach

React for rendering. D3 to help calculate props.

✌️

<!--- end-lecture -->

<!--- begin-lecture title="Money spent on Christmas - a line chart" -->

# Challenge

Christmas can be very expensive. Plot a line of how much americans think
they're spending on Christmas gifts over the years.

[Dataset](https://reactviz.holiday/datasets/statistic_id246963_average-spending-on-christmas-gifts-in-the-us-1999-2018.xlsx)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/YGv1LNgKbn4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/6yqx23v6mn?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Today we built a little line chart with two axes and emoji datapoints. Hover an
emoji, get a line highlighting where it falls on the axis. Makes it easy to see
what happened when.

It's interesting to see how Christmas spending was on the rise and reached a
peak in 2007. Crashed in 2008 then started rising again. Great insight into the
US economy.

When times are good, people buy gifts. When times are bad, people don't. 🧐

To build this linechart we used the same insight
[as yesterday](/christmas-trees/):

> Our data is static and never changes. We don't expect to change positions and
> size of our chart. That means we can cut some corners.

Once again we load data in `componentDidMount` using `d3.tsv` to parse a tab
separated values file. We feed the result array of objects into a `<Linechart>`
component.

## The basic linechart

Rendering a basic linechart was pretty quick: D3's got a line generator 🤙

![Just the line](https://github.com/Swizec/datavizAdvent/raw/master/src/content/money-spent/justline.png)

That's an SVG `<path>` using `d3.line` to create the `d` shape attribute.
Wrapped into a React component it looks like this:

```javascript
class Linechart extends React.Component {
  x = d3
    .scalePoint()
    .domain(this.props.data.map(d => d.year))
    .range([0, this.props.width]);
  y = d3
    .scaleLinear()
    .domain([500, d3.max(this.props.data, d => d.avg_spend)])
    .range([this.props.height, 0]);

  line = d3
    .line()
    .x(d => this.x(d.year))
    .y(d => this.y(d.avg_spend));

  render() {
    const { x, y, data } = this.props;

    return (
      <g transform={`translate(${x}, ${y})`}>
        <Line d={this.line(data)} />
      </g>
    );
  }
}
```

We define two scales, `x` and `y` to help us translate between datapoints and
coordinates on the screen. Without those year 2018 would render 2018 pixels to
the right and that's too much.

`x` is a point scale, which like [yesterday's band scale](/christmas-trees/)
neatly arranges datapoints along a axis. Unlike a band scale it places them in
points at the middle of each ragne.

`y` is a boring old liear scale. Americans spend so much on gifts that we cut
off the domain at \$500. Makes the graph more readable and less tall.

Then we have the line generator. We define it with `d3.line`, tell it how to
get `x` and `y` coordinates with our scales and leave the rest as defaults.

Rendering is a matter of creating a wrapping `<g>` element to position our
graph and group all future additions. Inside, we render a styled `<Line>`
component and feed data into the line generator. That handles the rest.

You have to style lines or they come out invisible.

```javascript
const Line = styled.path`
  stroke-width: 3px;
  stroke: ${d3.color('green').brighter(1.5)};
  fill: none;
  stroke-linejoin: round;
`;
```

Give it a nice thickness, some light green color, remove the default black
fill, and make edges round. Lovely.

Note the `d3.color('green').brighter(1.5)` trick. We can use D3 to manipulate
colors 🎨

## The axes

![Line with axes](https://github.com/Swizec/datavizAdvent/raw/master/src/content/money-spent/withaxes.png)

Because axes are a tricky best to build, we used a trick from
[React for Data Visualization](https://swizec1.teachable.com/p/react-for-data-visualization/) -
blackbox rendering.

That's when you take pure D3 code, wrap it in a React component, and let D3
handle the rendering. It's less efficient and doesn't scale as well, but
perfect for little things like this.

You can use my [d3blackbox](https://d3blackbox.com) library or make your own. I
used the lib 😛

```javascript
const BottomAxis = d3blackbox((anchor, props) => {
  const axis = d3.axisBottom().scale(props.scale);
  d3.select(anchor.current).call(axis);
});

const LeftAxis = d3blackbox((anchor, props) => {
  const axis = d3.axisLeft().scale(props.scale);
  d3.select(anchor.current).call(axis);
});
```

`BottomAxis` and `LeftAxis` are both tiny. Two lines of code is all you need to
render a axis with D3.

1. Define the axis generator and give it a scale. We took it from props.
2. Select the element you want to render into and call your generator

`d3blackbox` handles the rest.

It's a higher order component (hook version called `useD3` is also in the
package). Takes your render function whatever it is, renders an anchor element,
positions it with `x` and `y` props, and makes sure to call your render
function on any update.

Quickest way to slap some D3 into some React 👌

## The 💸 money emojis

How do you make a linechart more fun? You add money-flying-away emojis.

![Line with emojis](https://github.com/Swizec/datavizAdvent/raw/master/src/content/money-spent/moneymoji.png)

Interactive points on each edge of a linechart are pretty common after all.
Makes it easier to spot where the line breaks and shows actual data and where
it's just a line.

Adding emojis happens in a loop:

```javascript
{
  data.map(d => (
    <Money x={this.x(d.year)} y={this.y(d.avg_spend)}>
      💸
      <title>${d.avg_spend}</title>
    </Money>
  ));
}
```

Iterate through our data and render a styled `text` component called `Money`
for each datapoint. Using the same scales as we did for the linechart gives us
correct positioning out of the box.

One of the many benefits of scales 😉

Styling deals with setting emoji font size and centering text on the `(x, y)`
anchor point.

```javascript
const Money = styled.text`
  font-size: 20px;
  cursor: pointer;
  text-anchor: middle;
  alignment-baseline: central;
`;
```

Oh and adding a `<title>` tag to our text creates a default browser tooltip.
Hover over an emoji for a few seconds and it shows some extra info.

## A highlight for easy reading

![A highlight to make life easier](https://github.com/Swizec/datavizAdvent/raw/master/src/content/money-spent/highlight.png)

Linecharts can be hard to read. With datapoints so far from the axes it can be
hard to see how everything lines up.

So we added a line to help our users out.

We keep track of what's currently highlighted in component state. When a value
exists, we use it to render a vertical line.

```javascript
class Linechart extends React.Component {
  state = {
    highlightYear: null
  };

  // ...

  highlight = year => this.setState({ highlightYear: year });
  unhighlight = () => this.setState({ highlightYear: null });

  // ...

  {highlightYear ? (
    <Highlight
      x1={this.x(highlightYear)}
      y1={-20}
      x2={this.x(highlightYear)}
      y2={height + 20}
    />
  ) : null}

  // ...

  <Money
    x={this.x(d.year)}
    y={this.y(d.avg_spend)}
    onMouseOver={() => this.highlight(d.year)}
    onMouseOut={this.unhighlight}
  >
```

Nothing too crazy.

We have a `highlightYear` state. This gets set on `onMouseOver` in the
`<Money>` emoji. On `onMouseOut`, we reset the highlight year back to `null`.

In the render method we then check whether `highlightYear` is set. If it is, we
render a vertical line that's styled to be thin and lightgrey. If it isn't, we
don't.

There's a lot we could do with that highlight to make it look smoother, but
time was up and this is good enough.

## What you learned 🧐

Today you learned:

- D3 point scales
- using class field values for D3 objects
- d3blackbox for simple D3 integrations
- the `<title>` trick on text tags
- using D3 axes
- adding a little interactivity

Enjoy ✌️

<!--- end-lecture -->

<!--- begin-lecture title="Christmas movies at the box office - horizontal bar chart" -->

# Challenge

Christmas movies are the best movies. How much do they make at the box office?
Show the power distribution curve with a vertical barchart.

[Dataset](https://reactviz.holiday/datasets/statistic_id209295_box-office-revenue-of-the-most-successful-christmas-movies.xlsx)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/qD6i9h66LbI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/6v6zvx8zjk?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

We built this one with React hooks because we can. Not a class-based component
in sight ✌️

Styled components for styling, D3 for scales and data loading and parsing,
hooks to hook it all together.

## Loading data with React hooks

I looked around for a good data loading hook. None could be found. So we made
our own 💪

Not that hard as it turns out. You need a dash of `useState` to save the data
you load, a bit of `useEffect` to run data loading on component mount aaaand
... that's it. Goes in your `App` function.

```javascript
function App() {
  const [data, setData] = useState(null);

  useEffect(
    () => {
      d3.tsv("/data.tsv", d => {
        const year = Number(d.movie.match(/\((\d+)\)/)[1]);
        return {
          movie: d.movie.replace(/\(\d+\)/, ""),
          year: year,
          per_year: Number(d.box_office) / (2018 - year),
          box_office: Number(d.box_office)
        };
      }).then(setData);
    },
    [!data]
  );
```

The `useState` hook takes a default value, and always returns current state -
`data` - and a setter - `setData`.

`useEffect` runs our function on every component render. After committing to
the DOM, I believe. We use `d3.tsv` to load and parse our christmas movie
dataset, use a parsing function to transform each row into an object with all
the info we need, then call `setData` when he have it.

Each datapoint holds

- a `movie` name
- the `year` a movie was produced parsed from the movie name with a regex
- the `per_year` revenue of the movie as a fraction
- the total `box_office` revenue

## Switch display modes with React hooks

Movie box office revenue follows a pretty clear power law distribution. The
highest grossing movie or two make a lot more than the next best. Which makes
way more than next one down the list, etc.

But how does age factor into this?

Home Alone has had 28 years to make its revenue. Daddy's Home 2 is only a year
old.

I decided to add a button to switch modes. From total `box_office` to
`per_year` revenue. And boy does it change the story. Altho maybe I'm being
unfair because how long are theater runs anyway? 🤔

Driving that logic with React hooks looks like this 👇

```javascript
const [perYear, setPerYear] = useState(false)
const valueFunction = perYear ? d => d.per_year : d => d.box_office

// ...

<Button onClick={() => setPerYear(!perYear)}>
  {perYear ? "Show Total Box Office" : "Show Box Office Per Year"}
</Button>
```

A `useState` hook gives us current state and a setter. We use the state,
`perYear`, to define a value accessor function, and a butto's `onClick` method
to toggle the value.

We're going to use that value accessor to render our graph. Makes the switch
feel seamless.

## Render

First you need this bit in your `App` function. It renders `<VerticalBarchart>`
in an SVG, if `data` exists.

```javascript
<Svg width="800" height="600" showKevin={perYear}>
  {data && (
    <VerticalBarchart
      data={data}
      width={600}
      height={600}
      value={valueFunction}
    />
  )}
</Svg>
```

That `data && ...` is a common trick. The return value of `true && something`
is something, return value of `false && something` is nothing. Means when
`data` is defined, we render, otherwise we don't.

Oh and `Svg` is a styled SVG component. Gets a nice gif background when
`showKevin` is set to true 😛

The `VerticalBarchart` itself is a functional component. We said no classes
right?

```javascript
const VerticalBarchart = ({ data, width, height, value }) => {
  const yScale = d3
    .scaleBand()
    .paddingInner(0.1)
    .domain(data.map(d => d.movie))
    .range([0, height]);
  const widthScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, value)])
    .range([0, width]);

  return (
    <g>
      {data.map(d => (
        <React.Fragment key={d.movie}>
          <Bar
            x={0}
            y={yScale(d.movie)}
            height={yScale.bandwidth()}
            width={widthScale(value(d))}
          />
          <Label x={10} y={yScale(d.movie) + yScale.bandwidth() / 2}>
            {d.movie}
          </Label>
        </React.Fragment>
      ))}
    </g>
  );
};
```

We can define our D3 scales right in the render function. Means we re-define
them from scratch on every render and sometimes that's okay. Particularly when
data is small and calculating domains and ranges is easy.

Once we have a `scaleBand` for the vertical axis and a `scaleLinear` for
widths, it's a matter of iterating over our data and rendering styled `<Bar>`
and `<Label>` components.

Notice that we use the `value` accessor function every time we need the value
of a datapoint. To find the max value for our domain and to grab each
individual width.

Makes our chart automatically adapt to flicking that `perYear` toggle 👌

<video src="https://i.imgur.com/hJaR7e8.mp4" autoplay muted loop />

That smooth width transition effect? That's just CSS.

```javascript
const Bar = styled.rect`
  fill: green;
  transition: width 500ms;
`;
```

React hooks really do make life easy 🎣

## What you learned today

- the `useState` React hook
- the `useEffect` React hook
- that it's okay to define D3 stuff in the render method

<!--- end-lecture -->

<!--- begin-lecture title="What Americans want for Christmas - horizontal stack chart" -->

# Challenge

Different ages want different things. Create a horizontal stack chart showing
what everyone wants for Christmas.

[Dataset](https://reactviz.holiday/datasets/statistic_id643714_christmas-gifts-desired-by-us-consumers-2017-by-age-group.xlsx)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/pn45HcG1faM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/v874323625?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Today's challenge is a perfect example of how
[chroma-js](https://gka.github.io/chroma.js/) automatically makes your dataviz
beautiful. Best magic trick I ever learned from Shirley Wu.

We used [Susie Lu's d3-legend](https://d3-legend.susielu.com/) for the color
legend, D3's stack layout to calculate coordinates for stacking those bar
charts, D3 axis for the axis, and the rest was React. Similar code to the bar
chart in [Christmas movies at the box office](/christmas-movies/).

## Load the data

We begin once more by loading the data. If you've been following along so far,
this code will look familiar.

```javascript
  componentDidMount() {
    d3.tsv("/data.tsv", d => ({
      category: d.category,
      young: Number(d.young),
      mid: Number(d.mid),
      old: Number(d.old)
    })).then(data => this.setState({ data }));
  }
```

`d3.tsv` loads our tab separated values file with data, a parsing function
turns each line into nice objects we can use, and then we save it into
component local state.

## An axis and a legend

Building axes and legends from scratch is not hard, but it is fiddly and time
consuming and fraught with tiny little traps for you to fall into. No time for
that on a daily challenge!

[d3blackbox](https://d3blackbox.com) to the rescue! &lt;supermanemoji>

```javascript
const VerticalAxis = d3blackbox((anchor, props) => {
  const axis = d3.axisLeft().scale(props.scale);
  d3.select(anchor.current).call(axis);
});

const Legend = d3blackbox((anchor, props) => {
  d3.select(anchor.current).call(
    legend
      .legendColor()
      .scale(props.scale)
      .title('Age group')
  );
});
```

Here you can see just how flexible the blackbox rendering approach I teach in
[React for Data Visualization](https://swizec1.teachable.com/p/react-for-data-visualization)
can be. You can take just about any D3 code and turn it into a React component.

Means you don't have to write your own fiddly stuff 👌

`d3blackbox` ensures our render functions are called on every component render
and creates a positionable grouping, `<g>`, SVG element for us to move around.

## Each category's barchart

You can think a stacked bar chart as a series of barcharts. Each category gets
its own.

```javascript
const BarChart = ({ entries, y, width, marginLeft, color }) => (
  <React.Fragment>
    {entries.map(([min, max], i) => (
      <rect
        x={marginLeft + width(min)}
        width={width(max) - width(min)}
        y={y(y.domain()[i])}
        height={y.bandwidth()}
        key={y.domain()[i]}
        fill={color}
      >
        <title>
          {min}, {max}
        </title>
      </rect>
    ))}
  </React.Fragment>
);
```

These barchart subcomponents are fully controled components. They help us clean
up the rendering and don't need any logic of their own.

Takes a list of `entries` to render, a `y` scale for vertical positioning, a
`width` scale to calculate widths, some margin on the left for the big axis,
and a `color` to use.

Renders a React Fragment with a bunch of rectangles. Loop over the entries,
return a positioned rectangle for each.

Our entries are pairs of `min` and `max` values as calculated by the stack
layout. We use them to decide the horizontal, `x` position of our rectangle,
and its width. Using the `width` scale both times. That takes care of proper
sizing for us.

That `key` prop is a little funny though.

The `y` scale is an ordinal scale. Its domain is a list of categories, which
means we can get the name of each bar's category by picking the right index out
of that array. Perfect for identifying our elements :)

## A stack chart built with React and D3

Here's how all of that ties together 👇

```javascript
class StackChart extends React.Component {
  y = d3
    .scaleBand()
    .domain(this.props.data.map(d => d.category))
    .range([0, this.props.height])
    .paddingInner(0.1);
  stack = d3.stack().keys(['young', 'mid', 'old']);
  color = chroma.brewer.pastel1;
  colorScale = d3
    .scaleOrdinal()
    .domain(['🧒 18 to 29 years', '🙍‍♂️ 30 to 59 years', '🧓 60 years or older'])
    .range(this.color);

  render() {
    const { data } = this.props;

    const stack = this.stack(data);

    const width = d3
      .scaleLinear()
      .domain([0, d3.max(stack[2], d => d[1])])
      .range([0, 400]);

    return (
      <g>
        <VerticalAxis scale={this.y} x={220} y={0} />
        {this.stack(data).map((entries, i) => (
          <BarChart
            entries={entries}
            y={this.y}
            key={i}
            marginLeft={223}
            color={this.color[i]}
            width={width}
          />
        ))}
        <Legend scale={this.colorScale} x={500} y={this.props.height - 100} />
      </g>
    );
  }
}
```

Okay that's a longer code snippet 😅

### D3 setup

In the beginning, we have some D3 objects.

1. A `y` band scale. Handles vertical positioning, sizing, spacing, and all
2. A `stack` generator with hardcoded keys. We know what we want and there's no
   need to be fancy
3. A `color` list. Chroma's `brewer.pastel1` looked Best
4. A `colorScale` with a more verbose domain and our list of colors as the
   range

Having a separate list of colors and color scale is important. Our individual
bars want a specific color, our legend wants a color scale. They use different
domains and unifying them would be fiddly. Easier to keep apart.

### render

We do a little cheating in our `render` method. That `stack` should be
generated in a `componentDidUpdate` of some sort and so should the `width`
linear scale.

But our data is small so it's okay to recalculate all this every time.

The `stack` generator creates a list of lists of entries. 3 lists, one for each
category (age group). Each list contains pairs of numbers representing how they
should stack.

Like this

```
[
  [[0, 5], [0, 10]],
  [[5, 7], [10, 16]],
  [[13, 20], [26, 31]]
]
```

Entries in the first list all begin at `0`. Second list begins where the
previous list ends. Third list begins where the second list ended. Stacking up
as far as you need.

Your job is then to take these numbers, feed them into some sort of scale to
help with sizing, and render.

That was our `<BarChart>` sub component up above. It takes each list, feeds its
values into a `width` scale, and renders.

Making sure we render 3 of them, one for each age group, is this part:

```javascript
return (
  <g>
    <VerticalAxis scale={this.y} x={220} y={0} />
    {stack.map((entries, i) => (
      <BarChart
        entries={entries}
        y={this.y}
        key={i}
        marginLeft={223}
        color={this.color[i]}
        width={width}
      />
    ))}
    <Legend scale={this.colorScale} x={500} y={this.props.height - 100} />
  </g>
);
```

Starts by rendering an axis, followed by a loop through our stack, rendering a
`<BarChart>` for each, and then the `<Legend>` component neatly positioned to
look good.

A beautiful chart pops out.

![Beautiful chart](https://github.com/Swizec/datavizAdvent/raw/master/src/content/christmas-gifts/what-americas-want.png)

## Today you learned 🧐

- chroma-js exist and is amazing
- d3-legend for easy legends
- d3blackbox still saving the day
- D3 stack generator

🤓

<!--- end-lecture -->

<!--- begin-lecture title="Christmas carols and their words - a word cloud" -->

# Challenge

Christmas carols are a time honored tradition. Draw a heatmap of their most
popular words.

[Dataset](https://reactviz.holiday/datasets/christmas_carols_data.csv)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/x141XrIuP50" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/2nv1j4mwr?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Building these word clouds kicked my ass. Even had to ask the three wise men
for help.

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr">So apparently combining useState and useMemo and promises makes your JavaScript crash hard.<br><br>What am I doing wrong? <a href="https://twitter.com/ryanflorence?ref_src=twsrc%5Etfw">@ryanflorence</a> <a href="https://twitter.com/kentcdodds?ref_src=twsrc%5Etfw">@kentcdodds</a> <a href="https://twitter.com/dan_abramov?ref_src=twsrc%5Etfw">@dan_abramov</a> ? I thought useMemo was supposed to only run once and not infinite loop on me <a href="https://t.co/29OVRXxhuz">pic.twitter.com/29OVRXxhuz</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1071456819107622913?ref_src=twsrc%5Etfw">December 8, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Turns out that even though `useMemo` is for memoizing heavy computation, this
does not apply when said computation is asynchronous. You have to use
`useEffect`.

At least until suspense and async comes in early 2019.

Something about always returning the same Promise, which confuses `useMemo` and
causes an infinite loop when it calls `setState` on every render. That was fun.

There's some computation that goes into this one to prepare the dataset. Let's
start with that.

## Preparing word cloud data

Our data begins life as a flat text file.

```
Angels From The Realm Of Glory

Angels from the realms of glory
Wing your flight over all the earth
Ye, who sang creations story
Now proclaim Messiah's birth
Come and worship, come and worship
Worship Christ the newborn King
Shepherds in the fields abiding
Watching over your flocks by night
God with man is now residing
```

And so on. Each carol begins with a title and an empty line. Then there's a
bunch of lines followed by an empty line.

We load this file with `d3.text`, pass it into `parseText`, and save it to a
`carols` variable.

```javascript
const [carols, setCarols] = useState(null);

useEffect(() => {
  d3.text('/carols.txt')
    .then(parseText)
    .then(setCarols);
}, [!carols]);
```

Typical `useEffect`/`useState` dance. We run the effect if state isn't set, the
effect fetches some data, sets the state.

Parsing that text into individual carols looks like this

```javascript
function takeUntilEmptyLine(text) {
  let result = [];

  for (
    let row = text.shift();
    row && row.trim().length > 0;
    row = text.shift()
  ) {
    result.push(row.trim());
  }

  return result;
}

export default function parseText(text) {
  text = text.split('\n');

  let carols = { 'All carols': [] };

  while (text.length > 0) {
    const title = takeUntilEmptyLine(text)[0];
    const carol = takeUntilEmptyLine(text);

    carols[title] = carol;
    carols['All carols'] = [...carols['All carols'], ...carol];
  }

  return carols;
}
```

Our algorithm is based on a `takeUntil` function. It takes lines from our text
until some condition is met.

Basically:

1. Split text into lines
2. Run algorithm until you run out of lines
3. Take lines until you encounter an empty line
4. Assume the first line is a title
5. Take lines until you encounter an empty line
6. This is your carol
7. Save title and carol in a dictionary
8. Splat carrol into the `All carols` blob as well

We'll use that last one for a joint word cloud of all Christmas carols.

## Calculating word clouds with d3-cloud

With our carols in hand, we can build a word cloud. We'll use the wonderful
[d3-cloud](https://github.com/jasondavies/d3-cloud) library to handle layouting
for us. Our job is to feed it data with counted word frequencies.

Easiest way to count words is with a loop

```javascript
function count(words) {
  let counts = {};

  for (let w in words) {
    counts[words[w]] = (counts[words[w]] || 0) + 1;
  }

  return counts;
}
```

Goes over a list of words, collects them in a dictionary, and does `+1` every
time.

We use that to feed data into `d3-cloud`.

```javascript
function createCloud({ words, width, height }) {
  return new Promise(resolve => {
    const counts = count(words);

    const fontSize = d3
      .scaleLog()
      .domain(d3.extent(Object.values(counts)))
      .range([5, 75]);

    const layout = d3Cloud()
      .size([width, height])
      .words(
        Object.keys(counts)
          .filter(w => counts[w] > 1)
          .map(word => ({ word }))
      )
      .padding(5)
      .font('Impact')
      .fontSize(d => fontSize(counts[d.word]))
      .text(d => d.word)
      .on('end', resolve);

    layout.start();
  });
}
```

Our `createCloud` function gets a list of words, a width, and a height. Returns
a promise because d3-cloud is asynchronous. Something about how long it might
take to iteratively come up with a good layout for all those words. It's a hard
problem. 🤯

(that's why we're not solving it ourselves)

We get the counts, create a `fontSize` logarithmic scale for sicing, and invoke
the D3 cloud.

That takes a `size`, a list of words without single occurrences turned into
`{ word: 'bla' }` objects, some padding, a font size method using our
`fontSize` scale, a helper to get the word and when it's all done the `end`
event resolves our promise.

When that's set up we start the layouting process with `layout.start()`

## Animating words

Great. We've done the hard computation, time to start rendering.

We'll need a self-animating `<Word>` componenent that transitions itself into a
new position and angle. CSS transitions can't do that for us, so we'll have to
use D3 transitions.

```javascript
class Word extends React.Component {
  ref = React.createRef();
  state = { transform: this.props.transform };

  componentDidUpdate() {
    const { transform } = this.props;
    d3.select(this.ref.current)
      .transition()
      .duration(500)
      .attr('transform', this.props.transform)
      .on('end', () => this.setState({ transform }));
  }

  render() {
    const { style, children } = this.props,
      { transform } = this.state;

    return (
      <text
        transform={transform}
        textAnchor="middle"
        style={style}
        ref={this.ref}
      >
        {children}
      </text>
    );
  }
}
```

We're using my
[Declarative D3 transitions with React](https://swizec.com/blog/declarative-d3-transitions-react/swizec/8323)
approach to make it work. You can read about it in detail on my main blog.

In a nutshell:

1. Store the transitioning property in state
2. State becomes a sort of staging area
3. Take control of rendering in `componentDidUpdate` and run a transition
4. Update state after transition extends
5. Render `text` from state

The result are words that declaratively transition into their new positions.
Try it out.

## Putting it all together

Last step in the puzzle is that `<WordCloud>` component that was giving me so
much trouble and kept hanging my browser. It looks like this

```javascript
export default function WordCloud({ words, forCarol, width, height }) {
  const [cloud, setCloud] = useState(null);
  useEffect(() => {
    createCloud({ words, width, height }).then(setCloud);
  }, [forCarol, width, height]);

  const colors = chroma.brewer.dark2;

  return (
    cloud && (
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {cloud.map((w, i) => (
          <Word
            transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
            style={{
              fontSize: w.size,
              fontFamily: 'impact',
              fill: colors[i % colors.length],
            }}
            key={w.word}
          >
            {w.word}
          </Word>
        ))}
      </g>
    )
  );
}
```

A combination of `useState` and `useEffect` makes sure we run the cloud
generating algorithm every time we pick a different carol to show, or change
the size of our word cloud. When the effect runs, it sets state in the `cloud`
constant.

This triggers a render and returns a grouping element with its center in the
center of the page. `d3-cloud` creates coordinates spiraling around a center.

Loop through the cloud data, render a `<Word>` component for each word. Set a
transform, a bit of style, the word itself.

And voila, a declaratively animated word cloud with React and D3 ✌️

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr">With your powers combined I got it working! Thanks guys :) <a href="https://t.co/7qKr6joeRC">pic.twitter.com/7qKr6joeRC</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1071468363740639232?ref_src=twsrc%5Etfw">December 8, 2018</a></blockquote>

<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Original data from
[Drew Conway](https://github.com/drewconway/ZIA/tree/master/R/Very%20Data%20Christmas)

<!--- end-lecture -->

<!--- begin-lecture title="Will you buy a christmas tree? - a pie chart" -->

# Challenge

Not everyone buys a Christmas tree. 🎄 Draw a donut chart of people's thoughts.

[Dataset](https://reactviz.holiday/datasets/statistic_id644150_christmas-tree_-purchase-plans-among-us-consumers-2017.xlsx)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/aaqfCnE0G6s" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/zlkrm04jjl?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This donut chart build was short and sweet. D3 has all the ingredients we need,
Chroma's got the colors, d3-svg-legend has nice legend stuff. Oh and we used it
as an excuse to update my [d3blackbox](https://d3blackbox.com) library so it
actually exports the hooks version.

Thought it did, had it in the docs, published version didn't have it. 20 day
old issue report on GitHub. Oops 😅

You can see data loading in the Codesandbox above. Here's the fun stuff

## React and D3 pie chart tutorial with React hooks

Pie charts and donut charts are the same. If there's a hole in the middle it's
a donut, otherwise it's a pie. You should always make donuts because donuts are
delicious and easier to read due to intricacies around area size perception.

Our code fits in a functional React component

```javascript
const TreeDonut = ({ data, x, y, r }) => {};
```

Takes `data`, `x,y` coordinates for positioning, and `r` for the total radius.

We begin with a bunch of D3 objects. Scales, pie generators, things like that.

```javascript
const pie = d3.pie().value(d => d.percentage);
const arc = d3
  .arc()
  .innerRadius(90)
  .outerRadius(r)
  .padAngle(0.01);
const color = chroma.brewer.set1;
const colorScale = d3
  .scaleOrdinal()
  .domain(data.map(d => d.answer))
  .range(color);
```

Here's what they do:

1. The `d3.pie()` generator takes data and returns everything you need to
   create a pie chart. Start and end angles of each slice and a few extras.
2. The `d3.arc()` generator creates path definitions for pie slices. We define
   inner and outer radiuses and add some padding.
3. We take the `color` list from one of Chroma's pre-defined colors.
4. We'll use `colorScale` for the legend. Maps answers from our dataset to
   their colors

Next thing we need is some state for the overlay effect. It says which slice is
currently selected.

```javascript
const [selected, setSelected] = useState(null);
```

Hooks make this way too easy. 😛 We'll use `setSelected` to set the value and
store it in `selected`.

Then we render it all with a loop.

```javascript
return (
  <g transform={`translate(${x}, ${y})`}>
    {pie(data).map(d => (
      <path
        d={arc
          .outerRadius(selected === d.index ? r + 10 : r)
          .innerRadius(selected === d.index ? 85 : 90)(d)}
        fill={color[d.index]}
        onMouseOver={() => setSelected(d.index)}
        onMouseOut={() => setSelected(null)}
      />
    ))}
    <Legend x={r} y={r} colorScale={colorScale} />
  </g>
);
```

A grouping element positions our piechart from the center out.

Inside that group, we iterate over the output of our `pie()` generator and
render a `<path>` for each entry. Its shape comes from the `arc` generator.

We update inner and outer radius on the fly depending on whether the current
slice is highlighted. This creates the become-bigger-on-mouse-over effect. We
drive it with mouse event callbacks and the `setSelected` method.

`setSelected` stores the current selected index in `selected`. This triggers a
re-render. The selected slice shows as bigger.

Perfect 👌

## PS: The legend component with hooks is a piece of cake

`d3-svg-legend` does it all for us. We use `useD3` from my d3blackbox to make
it work.

```javascript
const Legend = function({ x, y, colorScale }) {
  const ref = useD3(anchor => {
    d3.select(anchor).call(d3legend.legendColor().scale(colorScale));
  });

  return <g transform={`translate(${x}, ${y})`} ref={ref} />;
};
```

Lets us render any D3 code into an anchor element and wrap it in a React
component. Behind the scenes `useD3` is a combination of `useRef` and
`useEffect`.

Enjoy ✌️

<!--- end-lecture -->

<!--- begin-lecture title="What goes in Chrstmas stockings - a piechart with tooltips" -->

# Challenge

Ever seen Christmas stockings? They get stuffed with all sorts of stuff. Build
a donut chart of what's what and add a mouse hover effect that shows what a
slice represents.

[Dataset](https://reactviz.holiday/datasets/statistic_id946574_gifts-likely-to-be-put-in-childs-christmas-stocking-in-the-us-in-2018.xlsx)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/8IOHiwI74Fc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/7mlxwrjw4x?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Tooltips ... tooltips are hard. So simple in theory yet organizing it into
sensible code will wreck your mind. 🤯

Your goal is to build this:

1. A tooltip component
2. Some way to store tooltip position and content
3. Ability to change that on mouse over

Mousing over a thing - slice of the donut chart in this case - updates
positioning and content. This triggers a tooltip re-render. Tooltip shows up
where you need saying what you want.

So how do you organize that in a way that makes sense?

🤔

You can watch me flounder around trying different solutions in the stream
above. In the end we went with a combination of state in the `App` component
and React Context shared between everyone else.

We're using React hooks because hooks are the hot new kid on the block and
learning new coding paradigms is fun.

## Managing and sharing tooltip state

```javascript
const [tooltip, setTooltip] = useState({
  show: false,
  x: 0,
  y: 0,
  content: '',
  orientLeft: false,
});
```

Our `tooltip` state holds a `show` flag, tooltip coordinates, and `content`.
`orientLeft` is the nascent beginnings of a fuller tooltip API. The tooltip
component is going to consume this context and use it to render itself.

To make changing this state easier, we sneakily include `setTooltip` in the
object passed into React Context itself.

```javascript
<TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
```

Now any consumer can change values in context. Whoa

![](https://media.giphy.com/media/SDogLD4FOZMM8/giphy.gif)

## The &lt;Tooltip> component

Our `<Tooltip>` component doesn't do much on its own. It's a wrapper that
handles positioning, visibility, and supports a nascent orientation API. We can
use `orientLeft` to align our tooltip left or right. A fuller API would also
have top/bottom and a bunch of similar features.

```javascript
const Tooltip = ({ width, height, children }) => {
  const { x, y, show, orientLeft } = useContext(TooltipContext);

  return (
    <g
      transform={`translate(${orientLeft ? x - width : x}, ${y})`}
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      <foreignObject width={width} height={height}>
        {children}
      </foreignObject>
    </g>
  );
};
```

`useContext` takes the `TooltipContext` object and returns its current value on
every render. We use destructuring to get at the parts we need: coordinates,
show flag, orientation.

Tooltip then renders a `<g>` grouping element with positioning based on the
orientation, and visibility based on the flag. Inside it wraps children in a
sized `foreignObject` element. This allows us to embed HTML inside SVG.

HTML is better for tooltip content than SVG because HTML supports text
automatic layouting. Set a width and the browser will figure out what to do
with long strings. Don't get that with SVG.

The `Tooltip.js` file also exports a React Context.

```javascript
const TooltipContext = React.createContext({
  show: false,
  x: 0,
  y: 0,
  orientLeft: false,
  content: '',
});

// ...
export default Tooltip;
export { TooltipContext };
```

Makes it easier to share the same context between different consumers.

## Render Tooltip in App

Rendering our tooltip happens in the main App component. It also holds tooltip
state that gets passed into React Context.

```javascript
import Tooltip, { TooltipContext } from "./Tooltip";

// ...

function App() {
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    content: "",
    orientLeft: false
  });

  return (
      <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
        <svg width="800" height="600">
          {* // where you put tooltip triggerers *}

          <Tooltip width={150} height={60}>
            <TooltipP>{tooltip.content}</TooltipP>
          </Tooltip>
        </svg>
      </TooltipContext.Provider>
  );
}
```

We import tooltip and its context, then `useState` to create a local `tooltip`
state and its setter. Pass both of those in a common object into a
`<TooltipContext.Provider`.

That part took me a while to figure out. Yes with React hooks you still need to
render Providers. Hooks are consumer side.

Render our Tooltip as a sibling to all the other SVG stuff. Any components that
want to render a tooltip will share the same one. That's how it usually works.

`<TooltipP>` is a styled component by the way.

```javascript
const TooltipP = styled.p`
  background: ${chroma('green')
    .brighten()
    .hex()};
  border-radius: 3px;
  padding: 1em;
`;
```

Nice green background, rounded corners, and a bit of padding.

![I am no designer](https://github.com/Swizec/datavizAdvent/raw/master/src/content/gift-stockings/tooltip-closeup.png)

I am no designer 😅

## Trigger tooltips from donuts

Donut code itself is based on code we built for the
[Will you buy a Christmas tree?](https://reactviz.holiday/buy-a-tree/) donut
chart.

We split it into the main donut component and a component for each slice, or
`<Arc>`. Makes it easier to calculate coordinates for tooltips. Means we ca
handle slice highlighted state locally in its own component.

```javascript
const Arc = ({ d, r, color, offsetX, offsetY }) => {
  const [selected, setSelected] = useState(false);
  const tooltipContext = useContext(TooltipContext);

  const arc = d3
    .arc()
    .outerRadius(selected ? r + 10 : r)
    .innerRadius(selected ? r - 80 : r - 75)
    .padAngle(0.01);

  const mouseOver = () => {
    const [x, y] = arc.centroid(d);

    setSelected(true);
    tooltipContext.setTooltip({
      show: d.index !== null,
      x: x + offsetX + 30,
      y: y + offsetY + 30,
      content: d.data.stuffer,
      orientLeft: offsetX < 0,
    });
  };

  const mouseOut = () => {
    setSelected(null);
    tooltipContext.setTooltip({ show: false });
  };

  return (
    <path
      d={arc(d)}
      fill={color}
      onMouseOver={mouseOver}
      onMouseOut={mouseOut}
      style={{ cursor: 'pointer' }}
    />
  );
};
```

Here you can see a downside of hooks: They can lead to pretty sizeable
functions if you aren't careful.

We create a `selected` flag and its setter with a `useState` hook and we hook
into our tooltip context with `useContext`. We'll be able to use that
`setTooltip` method we added to show a tooltip.

Then we've got that `const arc` stuff. It creates an arc path shape generator.
Radius depends on `selected` status.

All that is followed by our mouse eve handling fucntions.

```javascript
const mouseOver = () => {
  const [x, y] = arc.centroid(d);

  setSelected(true);
  tooltipContext.setTooltip({
    show: d.index !== null,
    x: x + offsetX + 30,
    y: y + offsetY + 30,
    content: d.data.stuffer,
    orientLeft: offsetX < 0,
  });
};
```

`mouseOver` is the active function. Mouse over an arc and it calculates its
center, sets the arc to `selected`, and pushes necessary info into tooltip
state. This triggers a re-render of the tooltip component and makes it show up.

Technically it triggers a re-render of our whole app because it's tied to `App`
state. You could split that out in a bigger app. Or rely on React being smart
enough to figure out the smallest possible re-render.

Deselecting the arc happens in a `mouseOut` function

```javascript
const mouseOut = () => {
  setSelected(false);
  tooltipContext.setTooltip({ show: false });
};
```

Set `selected` to falls and hide the tooltip.

With all that defined, rendering our arc is a matter of returning a path with
some attributes.

```javascript
return (
  <path
    d={arc(d)}
    fill={color}
    onMouseOver={mouseOver}
    onMouseOut={mouseOut}
    style={{ cursor: 'pointer' }}
  />
);
```

Use the arc generator to create the shape, fill it with color, set up mouse
events, add a dash of styling.

### Render a donut 🍩

We did all the complicated state and tooltip stuff in individual arcs. The
donut component uses a `pie` generator and renders them in a loop.

```javascript
const StockingDonut = ({ data, x, y, r }) => {
  const pie = d3.pie().value(d => d.percentage);

  const color = chroma.brewer.set3;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {pie(data).map(d => (
        <Arc
          d={d}
          color={color[d.index]}
          r={r}
          key={d.index}
          offsetX={x}
          offsetY={y}
        />
      ))}
    </g>
  );
};
```

`d3.pie` takes our data and returns all the info you need to build a donut.
Start angles, end angles, stuff like that.

Render a grouping element that centers our donut on `(x, y)` coordiantes,
render `<Arc>`s in a loop.

Make sure to pass offsetX and offsetY into each arc. Arcs are positioned
relatively to our donut center, which means they don't know their absolute
position to pass into the tooltip context. Offsets help with that.

## ✌️

And that's how you make tooltips in SVG with React hooks. Same concepts and
complications apply if you're using normal React state or even Redux or
something.

You need a global way to store info about the tooltip and some way to trigger
it from sibling components.

![](https://github.com/Swizec/datavizAdvent/raw/master/src/content/gift-stockings/christmas-stockings.png)

## PS: A neat way to useData

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Yeah I&#39;ve been doing that pattern a lot.<br><br>const [state, setState] = useState(null)<br>useEffect(() =&gt; doStuff().then(setState), [!state])</p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1071461874170945536?ref_src=twsrc%5Etfw">December 8, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Got tired of the `useState`/`useEffect` dance when loading data with hooks.
Built a new hook called `useData`. That's a neat feature of hooks; you can make
new ones.

```javascript
function useData(loadData) {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData(setData);
  }, [!data]);

  return data;
}
```

Takes a loadData function, sets up `useState` for the data, uses an effect to
load it, gives you `setData` so you can return the value, and returns the final
value to your component.

You use it like this 👇

```javascript
function App() {
  const data = useData(setData =>
    d3
      .tsv("/data.tsv", d => ({
        stuffer: d.stuffer,
        percentage: Number(d.percentage)
      }))
      .then(setData)
  );
```

Much cleaner I think 👌

Might be cleaner to take a promise and handle `setData` internally. Hmm ... 🤔

Thinking I might open source this, but it needs a few more iterations.

<!--- end-lecture -->

<!--- begin-lecture title="When Americans buy Christmas presents - a curved line chart" -->

# Challenge

My girlfriend likes to buy her presents early, I wait until the last minute.
What do other people do? Create a way to visualize the last few weeks of the
year and rank them by popularity.

[Dataset](https://reactviz.holiday/datasets/statistic_id246669_period-during-which-us-consumers-will-start-holiday-shopping-2018.xlsx)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/VzAAGCudLe8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/oq730593n9?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Well that was fun. What do you when you have a sparse dataset? A dataset with
so few data points positioned so weirdly that it's almost certain to hide
important trends?

You try to fix it.

With science! Math! Code!

Or ... well ... you can try. We tried a few things until we were forced to
admit defeat in the face of mathematics beyond our station. Or at least beyond
mine.

## Our dataset and what's wrong with it

We're visualizing results of a poll asking people _When do you start christmas
shopping?_. The poll had over 4000 responses. We get just the result.

```
Before October end	39
November before Thanksgiving	21
November after Thanksgiving	27
December	11
Janaury	2
February	0
```

39% start shopping before October ends, 21% in November before thanksgiving,
27% right after thanksgiving, and so on.

You can imagine these are long timespans. Ranging from basically a whole year
to just a week in length. That's a problem for us because it makes the
datapoints hard to compare.

Of course Before October end is overrepresented: It's got almost four times as
long to accumulate its result as the rest of the time periods combined.

## A simple presentation

We start exploring with a line chart. Borrowing a lot of code from the
[Money spent on Christmas](https://reactviz.holiday/money-spent/) challenge.

![](https://github.com/Swizec/datavizAdvent/raw/master/src/content/when-to-buy-gifts/plainchart.png)

That's our data plotted as a curved line. Circles represent the actual
datapoints we've got. Curves are a a good first approach to show that our data
might not be all that exact.

We borrow axis implementation from
[Money spent on Christmas](https://reactviz.holiday/money-spent/) using my
[d3blackbox](https://d3blackbox.com) library.

```javascript
const BottomAxis = d3blackbox((anchor, props) => {
  const axis = d3.axisBottom().scale(props.scale);
  d3.select(anchor.current).call(axis);
});

const LeftAxis = d3blackbox((anchor, props) => {
  const axis = d3
    .axisLeft()
    .scale(props.scale)
    .tickFormat(d => `${d}%`);
  d3.select(anchor.current).call(axis);
});
```

Each axis implementation renders an anchor element and injects a pure D3
rendered axis on every update. No need to fiddle with building our own.

### &lt;Datapoint>

A `<Datapoints>` component keeps our main code cleaner. Renders those tiny
little circles.

```javascript
const Circle = styled.circle`
  fill: none;
  stroke: black;
  r: 3px;
`;

const Datapoints = ({ data, x, y }) => (
  <g>
    {data.map(d => (
      <Circle cx={x(d.descriptor)} cy={y(d.percentage)}>
        <title>{d.descriptor}</title>
      </Circle>
    ))}
  </g>
);
```

Takes data, an `x` scale and a `y` scale. Walks through data in a loop, renders
circles with a title. Makes it so you can mouse over a circle and if you do it
just right a browser native tooltip appears.

### &lt;LineChart>

The LineChart component brings all of this together and uses a D3 line
generator for a single path definition.

```javascript
const Line = styled.path`
  fill: none;
  stroke: ${chroma("green").brighten(1.5)};
  stroke-width: 2px;
`;

class LineChart extends React.Component {
  height = 500

  x = d3.scalePoint()
    .domain(this.props.data.map(d => d.descriptor)
    .range([0, 600]),
  y = d3
    .scaleLinear()
    .domain([0, d3.max(this.props.data, d => d.percentage)])
    .range([this.height, 0])

  line = d3
    .line()
    .x(d => this.x(d.percentage))
    .y(d => this.y(d.descriptor))
    .curve(d3.curveCatmullRom.alpha(0.5))

  render() {
    const { data, x, y } = this.props;

    return (
      <g transform={`translate(${x}, ${y})`}>
        <Line d={this.line(data)} />
        <Datapoints data={data} x={this.x} y={this.y} />
        <BottomAxis scale={this.x} x={0} y={this.height} />
        <LeftAxis scale={this.y} x={0} y={0} />
      </g>
    )
  }
}
```

Sets up a horizontal `x` point scale, a vertical `y` scale with an inverted
range, a `line` generator with a curve, then renders it all.

Nothing too crazy going on here. You've seen it all before. If not, the
[Money spent on Christmas](https://reactviz.holiday/money-spent/) article
focuses more on the line chart part.

## Is it realistic?

So how realistic does this chart look to you? Does it represent the true
experience?

![](https://github.com/Swizec/datavizAdvent/raw/master/src/content/when-to-buy-gifts/plainchart.png)

Yes according to the data _most_ people start shopping before the end of
October. And it's true, very many start some time in November, with a moderate
spike around Black Friday and Cyber Monday.

Does the variation in time period hide important truths?

🤔

## Making an approximation

All of the above is true. And yet it hides an important fact.

39% before October end is a huge percentage. But it might mean August, last day
of October, or even March. Who knows? The data sure don't tell us.

And that week after thanksgiving? It's got more starting shoppers than all of
the rest of November combined. Even though it's just 1 week versus 3 weeks.

We can tease out these truths 👉 normalize our data by week.

![](https://github.com/Swizec/datavizAdvent/raw/master/src/content/when-to-buy-gifts/approximation.png)

Assume each datapoint spreads uniformly over its entire period, and a different
picture comes out.

October doesn't look so hot anymore, November looks better, January is chilly,
but then that Black Friday and Cyber Monday. Hot damn. Now _that_ is a spike in
shopping activity!

See how much stronger that spike looks when you normalize data by time period?
Wow.

### You can do it with a little elbow grease

We have to construct a fake dataset with extra points in between the original
data. Because our dataset is small, we could do this manually with just a bit
of maths.

Goes in `getDerivedStateFromProps`

```javascript
static getDerivedStateFromProps(props, state) {
    // Basic goal:
    // Split "Before October end" into 4 weekly datapoints
    // split "November before Thanksgiving" into 3 weekly datapoints
    // split "November after Thanksgiving" into 1 weekly datapoint
    // split "December" into 4 weekly datapoints
    // split "January" into 4 weekly datapoints
    const { data } = props,
      { x, xDescriptive } = state;

    const approximateData = [
      ...d3.range(4).map(_ => data[1].percentage / 4),
      ...d3.range(3).map(_ => data[1].percentage / 3),
      ...d3.range(1).map(_ => data[2].percentage / 1),
      ...d3.range(4).map(_ => data[3].percentage / 4),
      ...d3.range(4).map(_ => data[4].percentage / 4)
    ];

    x.domain(d3.range(approximateData.length));
    // Manually define range to match number of fake datapoints in approximateData
    xDescriptive.range([
      x(0),
      x(4),
      x(4 + 3),
      x(4 + 3 + 1),
      x(4 + 3 + 1 + 4),
      x(4 + 3 + 1 + 4 + 4 - 1)
    ]);

    return {
      approximateData,
      x,
      xDescriptive
    };
  }
```

We take `props` and `state`, then split every datapoint into its appropriate
number of weeks. Our approach is roughly based on the idea of a running
average. You could make a more generalized algorithm for this, but for a small
dataset it's easier to just do it like this.

So the whole of October, that first datapoint, becomes 4 entries with a fourth
of the value each. November turns into 3 with thirds. And so on.

Since we want to keep the original labeled axis and datapoints, we have to use
two different horizontal scales. One for the approximate dataset, one for the
original.

We put them in state so we can set them up in `getDerivedStateFromProps`.

```javascript
state = {
  x: d3.scalePoint().range([0, 600]),
  xDescriptive: d3
    .scaleOrdinal()
    .domain(this.props.data.map(d => d.descriptor)),
};
```

`x` is a point scale with a range. Its domain comes from our approximate
dataset. One for each entry based on the index.

`xDescriptive` works much like our old horizontal point scale. But because we
have to spread it over more datapoints that it never receives, it needs to be
an ordinal scale.

Ordinal scales map inputs directly into outputs. Like a dictionary. Our domain
becomes every descriptor from the dataset, the range we define manually to line
up with output from the `x` scale.

Rendering is still the same, we just gotta be careful which scale we pass into
which element.

```javascript
render() {
    const { data, x, y } = this.props,
      { approximateData } = this.state;

    return (
      <g transform={`translate(${x}, ${y})`}>
        <Line d={this.line(approximateData)} />
        <Datapoints data={data} x={this.state.xDescriptive} y={this.y} />
        <BottomAxis scale={this.state.xDescriptive} x={0} y={this.height} />
        <LeftAxis scale={this.y} x={0} y={0} />
      </g>
    );
  }
```

`<Line>` gets the approximate data set, `<Datapoints>` gets the original
dataset with the descriptive horizontal scale. The `<BottomAxis>` gets the
descriptive scale, and the `<LeftAxis>` stays the same.

End result is a chart that tells a more accurate story overlayed with the
original data.

![](https://github.com/Swizec/datavizAdvent/raw/master/src/content/when-to-buy-gifts/approximation.png)

## Attempting a more sophisticated solution

One thing still bothers me though. I bet you those weekly distributions aren't
uniform.

You're less likely to start Christmas shopping in the first week of October
than you are in the last week of October. Just like you're less likely to start
at the beginning of November than towards the end.

December should be the inverse. You're more likely to start in the first week
than you are the day before Christmas.

Know what I mean?

It just doesn't seem to fit real world experience that those weeks would have
even probabilities.

And that's our clue for next steps: You can fit a probability distribution over
your weeks, then generate random datapoints that fit the distribition to make a
nice smooth curve.

A sort of [Monte Carlo](https://en.wikipedia.org/wiki/Monte_Carlo_method)
approach. Commonly used for integration, fitting complex lines to
probabilities, and stuff like that.

> Monte Carlo methods (or Monte Carlo experiments) are a broad class of
> computational algorithms that rely on repeated random sampling to obtain
> numerical results. Their essential idea is using randomness to solve problems
> that might be deterministic in principle. They are often used in physical and
> mathematical problems and are most useful when it is difficult or impossible
> to use other approaches.

Is it difficult or impossible to use other approaches? I'm not sure.

There's different ways to fit a polygon to a set of known numbers. Our curve
approach did that actually.

Not sure we can do more than that with normal mathematics.

Unfortunately we were unable to implement a monte carlo method to approximate
more datapoints. We tried. It didn't produce good results.

The line kept being random, my math wasn't good enough to fit those random
numbers to a probability distribution and it was just a mess. But a promising
mess.

Basic idea goes something like this:

1. Define a probability distribution (less likely week 1, more likely week 4)
2. Pick random numbers
3. Keep going until the sum of your points adds up to the known value
4. Voila, in theory

You can watch me flounder around with this before I finally gave up in the
stream above.

See you tomorrow ✌️

<!--- end-lecture -->

<!--- begin-lecture title="When people buy candy - animated barchart with easing" -->

# Challenge

Candy is delicious. When do people buy it most? Visualize the data in a fun way

[Dataset](https://reactviz.holiday/datasets/statistic_id947149_retail-sales-of-candy-in-the-united-states-in-2018-by-week.xlsx)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/Dn_kHCFTUP4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/ov0lzxmplz?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Did you know Americans buy `Eight hundred million dollars` worth of candy on
Easter? That's crazy. Absolutely bonkers. Even the normal baseline of
`$300,000,000`/week throughout the year is just staggering. 🍭

What better way to visualize it than candy falling from the sky into the shape
of a bar chart?

![](https://i.imgur.com/z9bNPZL.gif)

The basic idea behind that visualization goes like this:

1. Load and parse data
2. Scale for horizontal position
3. Scale for vertical height
4. Render each bar in a loop
5. Divide height by `12`
6. Render that many emojis
7. Create a custom tween transition to independently animate horizontal and
   vertical positionioning in a declarative and visually pleasing way

😛

## The basics

Let's start with the basics and get them out of the way. Bottom up in the
Codesandbox above.

```javascript
const FallingCandy = ({ data, x = 0, y = 0, width = 600, height = 600 }) => {
  const xScale = d3
    .scalePoint()
    .domain(data.map(d => d.week))
    .range([0, width]);
  const yScale = d3
    .scaleLinear()
    .domain([250, d3.max(data, d => d.sales)])
    .range([height, 0]);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {data.map(d => (
        <CandyJar
          x={xScale(d.week)}
          y={height}
          height={height - yScale(d.sales)}
          delay={d.week * Math.random() * 100}
          type={d.special}
          key={d.week}
        />
      ))}
      <BottomAxis scale={xScale} x={0} y={height} />
      <LeftAxis scale={yScale} x={0} y={0} />
    </g>
  );
};
```

The `<FallingCandy>` component takes data, positioning, and sizing props.
Creates two scales: A point scale for horizontal positioning of each column, a
vertical scale for heights.

Render a grouping element to position everything, walk through the data and
render a `<CandyJar>` component for each entry. Candy jars need coordinates, a
height, some delay for staggered animations, and a type.

Type tells them which emoji to render. Makes it so we can have special harts on
Valentine's day, bunnies on Easter, jack-o-lanterns on Halloween, and Christmas
trees on Christmas.

I know this works because when my girlfriend saw it this morning she was like
_"Whaaat why so much candy on Easter?"_. Didn't even have to tell her what the
emojis mean 💪

We'll talk about the animation staggering later. I'll explain why it has to be
random as well.

## The axes

Using our standard approach for axes: use [d3blackbox](https://d3blackbox.com)
to render an anchor element, then take over with D3 and use an axis generator.

```javascript
const BottomAxis = d3blackbox((anchor, props) => {
  const scale = props.scale;
  scale.domain(scale.domain().filter((_, i) => i % 5 === 0));

  const axis = d3
    .axisBottom()
    .scale(props.scale)
    .tickFormat(d => `wk ${d}`);
  d3.select(anchor.current).call(axis);
});

const LeftAxis = d3blackbox((anchor, props) => {
  const axis = d3
    .axisLeft()
    .scale(props.scale)
    .tickFormat(d => `$${d} million`);
  d3.select(anchor.current).call(axis);
});
```

We have to filter the scale's domain for `<BottomAxis>` because point scales
are ordinal. That means there's no generalized way to interpolate values in
between other values, so the axis renders everything.

That looks terrible. Instead, we render every 5th tick.

Both axes get a custom `tickFormat` so they're easier to read.

## The &lt;CandyJar>

Candy jars are just columns of emojis. There's not much logic here.

```javascript
const CandyJar = ({ x, y, height, delay, type }) =>
  d3
    .range(height / 12)
    .map(i => (
      <Candy
        x={x}
        y={y - i * 12}
        type={type}
        delay={delay + i * Math.random() * 100}
        key={i}
      />
    ));
```

Yes, we could have done this in the main `<FallingCandy>` component. Code feels
cleaner this way.

Create a counting array from zero to `height/12`, the number of emojis we need,
walk through the array and render `<Candy>` components for each entry. At this
point we add some more random delay. I'll tell you why in a bit.

## The animated &lt;Candy> component

![](https://i.imgur.com/z9bNPZL.gif)

All that animation happens in the Candy component. Parent components are
blissfully unaware and other than passing a `delay` prop never have to worry
about the details of rendering and animation.

That's the beauty of declarative code. 👌

Our plan is based on my
[Declarative D3 transitions with React 16.3+](https://swizec.com/blog/declarative-d3-transitions-react/swizec/8323)
approach:

1. Move coordinates into state
2. Render emoji from state
3. Run transition on `componentDidMount`
4. Update state when transition ends

We use component state as a sort of staging area for transitionable props. D3
helps us with what it does best - transitions - and React almost always knows
what's going on so it doesn't get confused.

Have had issues in the past with manipulating the DOM and React freaking out at
me.

```javascript
class Candy extends React.Component {
  state = {
    x: Math.random() * 600,
    y: Math.random() * -50,
  };
  candyRef = React.createRef();

  componentDidMount() {
    const { delay } = this.props;

    const node = d3.select(this.candyRef.current);

    node
      .transition()
      .duration(1500)
      .delay(delay)
      .ease(d3.easeLinear)
      .attrTween('y', candyYTween(this.state.y, this.props.y))
      .attr('x', this.props.x)
      .on('end', () => this.setState({ y: this.props.y }));
  }

  get emoji() {
    // return emoji based on this.props.type
  }

  render() {
    const { x, y } = this.state;

    return (
      <text x={x} y={y} style={{ fontSize: '12px' }} ref={this.candyRef}>
        {this.emoji}
      </text>
    );
  }
}
```

We initate the `<Candy>` component in a random location off screen. Too high up
to be seen, somewhere on the visualization horizontally. Doesn't matter where.

I'll show you why random soon.

We create a ref as well. D3 will need that to get access to the DOM node.

Then we have `componentDidMount` which is where the transition happens.

### Separate, yet parallel, transitions for each axis

```javascript
  componentDidMount() {
    const { delay } = this.props

    const node = d3.select(this.candyRef.current)

    node
      .transition()
      .duration(1500)
      .delay(delay)
      .ease(d3.easeLinear)
      .attrTween('y', candyYTween(this.state.y, this.props.y))
      .attr('x', this.props.x)
      .on('end', () => this.setState({ y: this.props.y }))
  }
```

Key logic here is that we `d3.select()` the candy node, start a transition on
it, define a duration, pass the delay from our props, _disable_ easing
functions, and specify what's transitioning.

The tricky bit was figuring out how to run two different transitions in
parallel.

D3 doesn't do concurrent transitions, you see. You have to run **a**
transition, then the next one. Or you have to cancel the first transition and
start a new one.

Of course you _can_ run concurrent transitions on multiple attributes. But only
if they're both the same transition.

In our case we wanted to have candy bounce vertically and fly linearly in the
horizontal direction. This was tricky.

I mean I guess it's okay with a bounce in both directions? 🧐

![](https://i.imgur.com/L00eWnG.gif)

No that's weird.

### You can do it with a tween

First you have to understand some basics of how transitions and easing
functions work.

They're based on interpolators. An interpolator is a function that calculates
in-between values between a start and end value based on a `t` argument. When
`t=0`, you get the initial value. When `t=1` you get the end value.

```javascript
const interpolate = d3.interpolate(0, 100);

interpolate(0); // 0
interpolate(0.5); // 50
interpolate(1); // 1
```

Something like that in a nutshell. D3 supports much more complex interpolations
than that, but numbers are all we need right now.

Easing functions manipulate how that `t` parameter behaves. Does it go from `0`
to `1` linearly? Does it bounce around? Does it accelerate and slow down?

When you start a transition with `easeLinear` and `attr('x', this.props.x)` you
are essentially creating an interpolator from the current value of `x` to your
desired value, and the `t` parameter changes by an equal amount on every tick
of the transition.

If you have `1500` milliseconds to finish the transition (your duration),
that's 90 frames at 60fps. Means your `t` adds 0.01 on every tick of the
animation.

We can use that to create a custom tween for the vertical coordinate, `y`.

```javascript
function candyYTween(oldY, newY) {
  const interpolator = d3.interpolate(oldY, newY);
  return function() {
    return function(t) {
      return interpolator(d3.easeBounceOut(t));
    };
  };
}
```

`candyYTween` takes the initial and new coordinates, creates an interpolator,
and returns a function. This function returns a parametrized function that
drives our transition. For every `t` we return the value of our `interpolator`
after passing it through the `easeBounceOut` easing function.

We're basically taking a linear parameter, turning it into a bouncy paramater,
and passing _that_ into our interpolator. This creates a bouncy effect without
affecting the `x` coordinate in the other transition.

I don't know why we need the double function wrap, but it didn't work
otherwise.

## So why all the randomness?

Randomness makes our visualization look better. More natural.

Here's what it looks like without any `Math.random()`

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Here&#39;s why adding randomness to your animations matters 👇<br><br>This chart of candy buying habits in the US is not random at all. Delay based purely on array index. <a href="https://t.co/pTTWxovaSp">pic.twitter.com/pTTWxovaSp</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1073285327282876416?ref_src=twsrc%5Etfw">December 13, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Randomness on the CandyJar level.

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr">Here we add randomness to the column delay. <a href="https://t.co/ZPfQzInXvi">pic.twitter.com/ZPfQzInXvi</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1073285329237401600?ref_src=twsrc%5Etfw">December 13, 2018</a></blockquote>

Randomness on the CandyJar _and_ Candy level.

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr">Adding a random delay to each individual emoji makes it even better 🧐 <a href="https://t.co/Xn49KRbcCy">pic.twitter.com/Xn49KRbcCy</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1073285332555194369?ref_src=twsrc%5Etfw">December 13, 2018</a></blockquote>

Randomness in the start position as well.

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr">And when you add a random start point as well, that&#39;s when you unlock true beauty 👌<a href="https://twitter.com/hashtag/ReactVizHoliday?src=hash&amp;ref_src=twsrc%5Etfw">#ReactVizHoliday</a> Day 9 was fun like that.<br>Check it out here 👉 <a href="https://t.co/Yh62OVG3pW">https://t.co/Yh62OVG3pW</a> <a href="https://t.co/5N2gQJtfUX">pic.twitter.com/5N2gQJtfUX</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1073285334291501056?ref_src=twsrc%5Etfw">December 13, 2018</a></blockquote>

You decide which looks best ✌️

<!--- end-lecture -->

<!--- begin-lecture title="A responsive stack chart of smartphone market share" -->

# Challenge

Smartphones, magnificent little things. But there's only 4 kinds. Draw a
responsive stackchart of their marketshare.

[Dataset](https://reactviz.holiday/datasets/statistic_id266572_us-smartphone-market-share-2012-2018-by-month.xlsx)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/lbHy8SF39k8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/0xj8q4k2pp?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

We've built stackcharts before, on the
[What do Americans want for Christmas](https://reactviz.holiday/christmas-gifts/)
day. That means we can focus on teh responsive part today.

Although I still had to build the full stack chart from scratch and my
jetlagged brain struggled. Sorry viewers. You might want to skip the first
several minutes of the stream 😅

## How to make a responsive chart with React and D3

There's two parts to making responsive charts and data visualizations:

1. Build your chart so it conforms to a width and height
2. Use CSS to resize your SVG based on viewport size
3. React to window size changes
4. Read SVG size
5. Pass it into your chart

We'll go from the outside-in.

### Dynamically sized SVG

There's a few ways you can render your SVG so it resizes based on available
space. Flexbox, css grid, old school CSS tricks.

The easist is a `100%` width.

```javascript
<svg width="100%" height="400" ref={this.svgRef}>
  {data && (
    <ResponsiveStackChart
      data={data}
      keys={['android', 'ios', 'blackberry', 'microsoft']}
      width={width}
      height={height}
    />
  )}
</svg>
```

Our SVG always occupies the full width of its parent div - the whole page in
our case. It contains a `<ResponsiveStackChart>` that accepts width, height,
and data.

Those four come from state.

```javascript
const { data, width, height } = this.state;
```

You could track different widths for different charts, do some layouting,
things like that. We don't need those complications because this is a small
example.

### Listen to window size changes

Now that we have a dynamic SVG, we have to read its size every time the window
size changes. That happens when users resize their browser (never), or when
they turn their phone (sometimes).

In reality this part almost never happens. People rarely resize their browsers
and only turn their phones if you give them a reason to. But it's a nice touch
when we're talking about responsive :)

We add a listener to the `resize` window event in `componentDidMount` and
remove it in `componentWillUnmount`. Both in the main App componenet.

```javascript
componentDidMount() {
    // data loading

    this.measureSVG();
    window.addEventListener("resize", this.measureSVG);
}

componentWillUnmount() {
    window.removeEventListener("resize", this.measureSVG);
}
```

`measureSVG` is where the next bit happens.

### Measure SVG element size

A useful DOM method engineers often forget exists is `getBoundingClientRect`.
Tells you the exact size of a DOM node. Great for stuff like this 👌

```javascript
measureSVG = () => {
  const { width, height } = this.svgRef.current.getBoundingClientRect();

  this.setState({
    width,
    height,
  });
};
```

Take the bounding client rect of our SVG element, read out its width and
height, save it to state. This triggers a re-render of our app, passes new
sizing props into the chart, and the chart resizes itself.

![](https://media.giphy.com/media/12NUbkX6p4xOO4/giphy.gif)

## A chart that listens to its width and height

Now that we've got dynamic always accurate width and height, we have to listen
to them.

Best way to do that is with D3 scales that you keep up to date. We use the
dynamic full integration approach from my
[React for Data Visualization](https://swizec1.teachable.com/p/react-for-data-visualization/)
course.

That means:

1. Scales go into state
2. Scales update their domain and range in `getDerivedStateFromProps`

```javascript
class ResponsiveStackChart extends React.Component {
  state = {
    xScale: d3
      .scaleBand()
      .domain(this.props.data.map(d => d.date))
      .range([0, 600]),
    yScale: d3.scaleLinear().range([0, 600])
  };
  stack = d3.stack().keys(this.props.keys);
  color = chroma.brewer.Paired;

  static getDerivedStateFromProps(props, state) {
    let { xScale, yScale } = state;

    xScale.domain(props.data.map(d => d.date)).range([0, props.width]);
    yScale.range([0, props.height - 50]);

    return {
      ...state,
      xScale,
      yScale
    };
  }
```

We define default state for our `xScale` and `yScale`. Both assume the chart is
going to be 600x600 pixels. xScale has a domain with every identifier in our
dataset, the month/year, and yScale will get its domain in the render function.
I'll explain why.

`getDerivedStateFromProps` runs every time our component updates for any
reason. A good place to update our scales so they fit any new into from props.

We redefine their ranges to match the `width` and `height` props. If we are
careful to always rely on scales to position and size elements on our chart,
the chart will automatically resize.

### The stack layout

To avoid calculating the stack layout multiple times, we do it in the render
method. Need its data for rendering and for the `yScale` domain.

```javascript
render() {
    const { data, height } = this.props,
      { yScale, xScale } = this.state;
    const stack = this.stack(data);

    yScale.domain([0, d3.max(stack[stack.length - 1].map(d => d[1]))]);
```

The `stack` generator returns an array of arrays. At the top level we have an
array for every `key` in our dataset. Inside is an array of tuples for each
datapoint. The touples hold a `min` and `max` value that tells us where a
datapoint starts and ends.

We use `d3.max` to find the highest value in the stack data and feed it into
yScale's domain so it can proportionally size everything when we render.

👌

## An axis with dynamic number of tricks

The last step is making our axis look good at every size. We have to make sure
ticks don't overlap and their number adapts to available space.

```javascript
const BottomAxis = d3blackbox((anchor, props) => {
  const scale = props.scale,
    tickWidth = 60,
    width = scale.range()[1],
    tickN = Math.floor(width / tickWidth),
    keepEveryNth = Math.floor(scale.domain().length / tickN);

  scale.domain(scale.domain().filter((_, i) => i % keepEveryNth === 0));

  const timeFormat = d3.timeFormat('%b %Y');
  const axis = d3
    .axisBottom()
    .scale(props.scale)
    .tickFormat(timeFormat);
  d3.select(anchor.current).call(axis);
});
```

This is quite mathsy. The idea works like this:

1. Decide how much room you want for each tick - `tickWidth`
2. Read the width from scale.range - `width`
3. Use division to decide how many ticks fit - `tickN`
4. Some more division to decide every Nth tick you can keep - `keepEveryNth`

Then we filter the scale's domain and keep only every `keepEveryNth` element.

Only reason we need this is because we're using a band scale, which is an
ordinal scale. Means D3 can't easily interpolate datapoints and figure these
things out on its own.

The result is a perfectly responsive chart 👇

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">A responsive <a href="https://twitter.com/hashtag/react?src=hash&amp;ref_src=twsrc%5Etfw">#react</a> and <a href="https://twitter.com/hashtag/d3?src=hash&amp;ref_src=twsrc%5Etfw">#d3</a> stackchart. <a href="https://twitter.com/hashtag/ReactVizHoliday?src=hash&amp;ref_src=twsrc%5Etfw">#ReactVizHoliday</a> 10<br><br>👉 <a href="https://t.co/8a8r5ifhyz">https://t.co/8a8r5ifhyz</a> <a href="https://t.co/kMWgUAZB4J">pic.twitter.com/kMWgUAZB4J</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1074202928221700097?ref_src=twsrc%5Etfw">December 16, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<!--- end-lecture -->

<!--- begin-lecture title="A Sankey diagram" -->

# Challenge

> Have you ever tried making a sankey diagram with d3+react, I can't seem to
> make it work for some reason.:/ Emil

No Emil, I have not. Let's give it a shot! Thanks for finding us a dataset that
fits :)

[Dataset](https://reactviz.holiday/datasets/ugr-sankey-openspending.json)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/SAmKimb8wFo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/m9vy7mr5k8?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## What is a Sankey diagram?

[Sankey diagrams](https://en.wikipedia.org/wiki/Sankey_diagram) are flow
diagrams. They're often used to show flows of money and other resources between
different parts of an organization. Or between different organizations. Sankey
originally designed them to show energy flows in factories.

Vertical rectangles represent nodes in the flow, lines connecting the
rectangles show how each node contributes to the inputs of the next node. Line
thickness correlates to flow magnitude.

One of the most famous Sankey diagrams in history is this visualization of
Napoleon's invasion into Russia.

![](https://upload.wikimedia.org/wikipedia/commons/2/29/Minard.png)

No I'm not quite sure how to read that either. But it's cool and it's old ✌️

## How do you make a sankey with React and D3?

Turns out building a Sankey diagram with React and D3 isn't terribly difficult.
A D3 extension library called [d3-sankey](https://github.com/d3/d3-sankey)
provides a generator for them. Your job is to fill it with data, then render.

The dataset Emil found for us was specifically designed for Sankey diagrams so
that was awesome. Thanks Emil. 🙏🏻

I don't know what _our_ data represents, but you gotta wrangle yours into
`nodes` and `links`.

1. `nodes` are an array of representative keys, names in our case
2. `links` are an array of objects mapping a `source` inex to a `target` index
   with a numeric `value`

```json
{
  "nodes": [
    {
      "name": "Universidad de Granada"
    },
    {
      "name": "De Comunidades Autónomas"
    },
   //...
  ],
  "links": [
    {
      "source": 19,
      "target": 26,
      "value": 1150000
    },
    {
      "source": 0,
      "target": 19,
      "value": 283175993
    },
    //...
}
```

### Turn data into a Sankey layout

We can keep things simple with a functional component that calculates the
Sankey layout on the fly with every render. We'll need some color stuff too.
That was actually the hardest, lol.

```javascript
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
//...

const MysteriousSankey = ({ data, width, height }) => {
  const { nodes, links } = sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 5]])(data);
  const color = chroma.scale("Set3").classes(nodes.length);
  const colorScale = d3
    .scaleLinear()
    .domain([0, nodes.length])
    .range([0, 1]);
```

It's called `MysteriousSankey` because I don't know what our dataset
represents. Takes a width, a height, and a data prop.

We get the `sankey` generator from `d3-sankey`, initialize a new generator with
`sankey()`, define a width for our nodes and give them some vertical padding.
Extent defines the size of our diagram with 2 coordinates: the top left and
bottom right corner.

Colors are a little trickier. We use `chroma` to define a color scale based on
the predefined `Set3` brewer category. We split it up into `nodes.length` worth
of colors - one for each node. But this expects inputs like `0.01`, `0.1` etc.

To make that easier we define a `colorScale` as well. It takes indexes of our
nodes and translates them into those 0 to 1 numbers. Feed that into the `color`
thingy and it returns a color for each node.

### Render your Sankey

A good approach to render your Sankey diagram is using two components:

1. `<SankeyNode>` for each node
2. `<SankeyLink>` for each link between them

You use them in two loops in the main `<MysteriousSankey>` component.

```javascript
return (
  <g style={{ mixBlendMode: 'multiply' }}>
    {nodes.map((node, i) => (
      <SankeyNode
        {...node}
        color={color(colorScale(i)).hex()}
        key={node.name}
      />
    ))}
    {links.map((link, i) => (
      <SankeyLink
        link={link}
        color={color(colorScale(link.source.index)).hex()}
      />
    ))}
  </g>
);
```

Here you can see a case of inconsistent API design. `SankeyNode` gets node data
splatted into props, `SankeyLink` prefers a single prop for all the `link`
info. There's a reason for that and you might want to keep to the same approach
in both anyway.

Both also get a `color` prop with the messiness of translating a node index
into a `[0, 1]` number passed into the chroma color scale, translated into a
hex string. Mess.

### &lt;SankeyNode>

```javascript
const SankeyNode = ({ name, x0, x1, y0, y1, color }) => (
  <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={color}>
    <title>{name}</title>
  </rect>
);
```

`SankeyNode`s are rectangles with a title. We take top left and bottom right
coordinates from the sankey generator and feed them into rect SVG elements.
Color comes form the color prop.

### &lt;SankeyLink>

```javascript
const SankeyLink = ({ link, color }) => (
  <path
    d={sankeyLinkHorizontal()(link)}
    style={{
      fill: 'none',
      strokeOpacity: '.3',
      stroke: color,
      strokeWidth: Math.max(1, link.width),
    }}
  />
);
```

`SankeyLink`s are paths. We initialze a `sankeyLinkHorizontal` path generator
instance, feed it `link` info and that creates the path shape for us. This is
why it was easier to get everything in a single `link` prop. No idea which
arguments the generator actually uses.

Styling is tricky too.

Sankey links are lines. They don't look like lines, but that's what they are.
You want to make sure `fill` is set to nothing, and use `strokeWidth` to get
that nice volume going.

The rest is just colors and opacities to make it look prettier.

A sankey diagram comes out 👇

![](https://github.com/Swizec/datavizAdvent/raw/master/src/content/sankey/sankey.png)

You can make it betterer with some interaction on the nodes or even links.
They're components so the world is your oyster. Anything you can do with
components, you can do with these.

<!--- end-lecture -->

<!--- begin-lecture title="Try Uber's WebGL dataviz library" -->

# Challenge

Uber has built a cool suite of data visualization tools for WebGL. Let's
explore

[Dataset](https://reactviz.holiday/datasets/ugr-sankey-openspending.json)

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/hwIy2dYe6hc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/kkr948o597?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Today was not a great success so tomorrow's gonna be part two.

We explored Uber's suite of WebGL-based data visualization libraries from
[vis.gl](http://vis.gl/). There's a couple:

1. `deck.gl` is for layering data visualization layers on top of maps
2. `luma.gl` is the base library that everything else uses
3. `react-map-gl` is a React-based base layer for maps, you then use deck.gl to
   add layers
4. `react-vis` is Uber's take on the "react abstraction for charts" class of
   libraries. Renders to SVG

Trying out [luma.gl](https://luma.gl/) seemed like the best way to get started.
It powers everything else and if we're gonna build custom stuff ... well.

Implementing this example of wandering triangles seemed like a good idea.

<iframe
  src="https://luma.gl/#/examples/core-examples/transform-webgl-2"
  width="100%"
  height="500"
/>

Copy pasting a bunch of code and trying to understand what it does even better.

So we built a React harness, spelunked through the demo code, and learned a few
things about WebGL.

```javascript
<LumaFragment component="canvas" />
```

`<LumaFragment>` is a [d3blackbox](https://d3blackbox.com) component. It
creates a canvas element and lets our render function take over. Our function
is mostly a copy paste job.

In this we learned that WebGL renders onto `<canvas>`. Somehow I never realized
that before.

We create LumaFragment like this:

```javascript
const LumaFragment = d3blackbox((anchor, props) => {
    // copy pasta code from official example

    animationLoop.start({ canvas: anchor.current });
}
```

The official example creates an `animationLoop` based on the `AnimationLoop`
import from luma.gl. It works like a game loop approach I believe.

There's 3 event callbacks the code hooks into:

1. `onInitialize`, which initializes objects and sets up the visualization
2. `onRender`, which runs on every loop of the animation. I think
3. `onFinalize`, which runs when the animation runs out, but it looks like
   that's never

I'd explain the code inside those callbacks here, if I understood it well
enough. Right now it still looks a little alien and hard to grok.

What I _can_ tell you, however, it's that it is designed to run fast. There's a
lot of low level stuff creeping in. Like using `Float32Array` instead of just
Array because it's typed.

Yes, some JavaScript is typed didn't you know?

And it uses a lot of Buffers. Those are low level memory blocks with direct
access from the GPU. Makes it faster than working with higher level JavaScript
abstractions.

Another trick for more speed is that much of the hard logic happens in shaders.

We put our shaders in the `shaders.js` file. Shaders are low-level GPU code,
originally named after shading effects, but doing all sorts of stuff these
days.

Our example uses 3 shaders: `EMIT_VS`, `DRAW_VS`, `DRAW_FS`. They seem to
control how our triangles render and behave, but I haven't been able to figure
out how the JavaScript part ties together with the shaders part.

Guess that's our next step.

Also figuring out why this happens:

Join me tomorrow. We'll have fun :)

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">That went well ...<br><br>We continue tomorrow!<br><br>👉 <a href="https://t.co/I0MfSzduvn">https://t.co/I0MfSzduvn</a> <a href="https://t.co/DECiZJHPXN">pic.twitter.com/DECiZJHPXN</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1075059774708953088?ref_src=twsrc%5Etfw">December 18, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<!--- end-lecture -->

<!--- begin-lecture title="Real-time WebGL map of all airplanes in the world" -->

# Challenge

Uber has built a cool suite of data visualization tools for WebGL. Let's
explore with a real-time dataset of global airplane positions.

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/YGv1LNgKbn4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/6yqx23v6mn?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
Giving up on [luma.gl](https://reactviz.holiday/lumagl-pt1/) as too low level, we tried something else: [Deck.gl](http://deck.gl). Same suite of WebGL React tools from Uber but higher level and therefore more fun.

Of course Deck.gl is built for maps so we had to make a map. What better way to
have fun with a map than drawing live positions of all airplanes in the sky?

All six thousand of them. Sixty times per second.

Yes we can! 💪

This is the plan:

1. Fetch data from [OpenSky](https://opensky-network.org)
2. Render map with [react-map-gl](https://github.com/uber/react-map-gl)
3. Overlay a Deck.gl
   [IconLayer](http://deck.gl/#/documentation/deckgl-api-reference/layers/icon-layer)
4. Predict each airplane's position on the next Fetch
5. Interpolate positions 60 times per second
6. Update and redraw

Out goal is to create a faux live map of airplane positions. We can fetch real
positions every 10 seconds per OpenSky usage policy.

You can see the
[full code on GitHub](https://github.com/Swizec/webgl-airplanes-map). No
Codesandbox today because it makes my computer struggle when WebGL is involved.

<TweetEmbed id="1076067452038115328" options={{ conversation: 'none' }} />

See the airplanes in your browser 👉
[click me 🛩](https://create-react-app-gsqfy1eaq.now.sh)

## Fetch data from OpenSky

OpenSky is a receiver network which continuously collects air traffic
surveillance data. They keep it for forever and make it available via an API.

As an anon user you can get real-time data of all the world's airplanes current
positions every 10 seconds. With some finnagling you can get historic data,
super real-time stuff, and so on. We don't need any of that.

We `fetchData` in `componentDidMount`. Parse each entry into an object, update
local state, and start the animation. Also schedule the next fetch.

```javascript
componentDidMount() {
    this.fetchData();
}

fetchData = () => {
    d3.json("https://opensky-network.org/api/states/all").then(
        ({ states }) =>
            this.setState(
                {
                    // from https://opensky-network.org/apidoc/rest.html#response
                    airplanes: states.map(d => ({
                        callsign: d[1],
                        longitude: d[5],
                        latitude: d[6],
                        velocity: d[9],
                        altitude: d[13],
                        origin_country: d[2],
                        true_track: -d[10],
                        interpolatePos: d3.geoInterpolate(
                            [d[5], d[6]],
                            destinationPoint(
                                d[5],
                                d[6],
                                d[9] * this.fetchEverySeconds,
                                d[10]
                            )
                        )
                    }))
                },
                () => {
                    this.startAnimation();
                    setTimeout(
                        this.fetchData,
                        this.fetchEverySeconds * 1000
                    );
                }
            )
    );
};
```

`d3.json` fetches JSON data from a URL, returns a promise. We map through the
data and assign indexes to representative object keys. Makes the other code
easier to read.

In the `setState` callback, we start the animation and use a `setTimeout` to
call `fetchData` again in 10 seconds. More about teh animation in a bit.

## Render map with react-map-gl

Turns out rendering a map with Uber's react-map-gl is really easy. The library
does everything for you.

```javascript
import { StaticMap } from 'react-map-gl'
import DeckGL, { IconLayer } from "deck.gl";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = '<your token>'

// Initial viewport settings
const initialViewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 5,
  pitch: 0,
  bearing: 0,
}

// ...

<DeckGL
    initialViewState={initialViewState}
    controller={true}
    layers={layers}
>
    <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
</DeckGL>
```

That is all.

You need to create a Mapbox account and get your token, the `initialViewState`
I copied from Uber's docs. It points to San Francisco.

In the render method you then return `<DeckGL` which sets up the layering
stuff, and plop a `<StaticMap>` inside. This gives you pan and zoom behavior
out of the box. I'm sure with some twiddling you could get cool views and
rotations and all sorts of 3D stuff.

I say that because I've seen pics in Uber docs :P

## Overlay a Deck.gl IconLayer

That `layers` prop needs a list of layers. You're meant to create a new copy on
every render, but internally Deck.gl promises to keep things memoized and
figure out a minimal set of changes necessary. How they do that I don't know
and as long as it works it doesn't really matter how.

We configure the icon layer like this:

```javascript
import Airplane from './airplane-icon.jpg';

const layers = [
  new IconLayer({
    id: 'airplanes',
    data: this.state.airplanes,
    pickable: false,
    iconAtlas: Airplane,
    iconMapping: {
      airplane: {
        x: 0,
        y: 0,
        width: 512,
        height: 512,
      },
    },
    sizeScale: 20,
    getPosition: d => [d.longitude, d.latitude],
    getIcon: d => 'airplane',
    getAngle: d => 45 + (d.true_track * 180) / Math.PI,
  }),
];
```

We name it `airplanes` because it's showing airplanes, pass in our data, and
define the airplane icon. `iconAtlas` is a sprite and the mapping specifies
which parts of the image map to which name. With just one icon in the image
that's pretty quick.

We use `getPosition` to fetch longitude and latitude from each airplane and
pass it to the drawing layer. `getIcon` specifies that we're rendering the
`airplane` icon and `getAngle` rotates everything first by 45 degrees because
our icon is weird, and then by the direction of the airplane from our data.

`true_track` is the airplane's bearing in radians so we transform it to degrees
with some math.

![](https://github.com/Swizec/datavizAdvent/blob/master/src/content/webgl-airplanes/airplane-icon.jpg)

## Predict airplanes' next position

Predicting each airplane's position 10 seconds from now is ... mathsy.
Positions are in latitudes and longitudes, velocities are in meters per second.

I'm not so great with spherical euclidean maths so I borrowed the solution from
[StackOverflow](https://stackoverflow.com/questions/19352921/how-to-use-direction-angle-and-speed-to-calculate-next-times-latitude-and-longi)
and made some adjustments to fit our arguments.

We use that to create a `d3.geoInterpolate` interpolator between the start and
end point. That enables us to feed in numbers between 0 and 1 and get airplane
positions at specific moments in time.

```javascript
interpolatePos: d3.geoInterpolate(
  [d[5], d[6]],
  destinationPoint(d[5], d[6], d[9] * this.fetchEverySeconds, d[10])
);
```

Gobbledygook. Almost as bad as the
[destinationPoint function code](https://github.com/Swizec/webgl-airplanes-map/blob/master/src/destinationPoint.js)

## Interpolate and redraw

With that interpolator in hand, we can start our animation.

```javascript
currentFrame = null;
timer = null;

startAnimation = () => {
  if (this.timer) {
    this.timer.stop();
  }
  this.currentFrame = 0;
  this.timer = d3.timer(this.animationFrame);
};

animationFrame = () => {
  let { airplanes } = this.state;
  airplanes = airplanes.map(d => {
    const [longitude, latitude] = d.interpolatePos(
      this.currentFrame / this.framesPerFetch
    );
    return {
      ...d,
      longitude,
      latitude,
    };
  });
  this.currentFrame += 1;
  this.setState({ airplanes });
};
```

We use a `d3.timer` to run our `animationFrame` function 60 times per second.
Or every `requestAnimationFrame`. That's all internal and D3 figures out the
best option.

Also gotta make sure to stop any existing timers when running a new one :)

The `animationFrame` method itself maps through the airplanes and creates a new
list. On each iteration we copy over the whole datapoint and use the
interpolator we defined earlier to calculate the new position.

To get numbers from 0 to 1 we try to predict how many frames we're gonna render
and keep track of which frame we're at. So 0/60 gives 0, 10/60 gives 0.16,
60/60 gives 1 etc. The interpolator takes this and returns geospatial positions
along that path.

Of course this can't take into account any changes in direction the airplane
might make.

Updating component state triggers a re-render.

## And that's cool

What I find really cool about all this is that even though we're copying and
recreating and recalculating and ultimately redrawing some 6000 airplanes it
works smoothly. Because WebGL is more performant than I ever dreamed possible.

We could improve performance further by moving this animation out of React
state and redraw into vertex shaders but that's hard and turns out we don't
have to.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Look at those little WebGL airplanes go! 🛩<br><br>👉 <a href="https://t.co/Q7rpzKGQHi">https://t.co/Q7rpzKGQHi</a> <a href="https://t.co/xOMUJk1J2Z">pic.twitter.com/xOMUJk1J2Z</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1076067452038115328?ref_src=twsrc%5Etfw">December 21, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<!--- end-lecture -->

<!--- begin-lecture title="A compound arc chart" -->

# Challenge

Kiran has a problem. He's working on a project and doesn't know how. Let's help

# My Solution

<iframe width="560" height="315" src="https://www.youtube.com/embed/_tNeyToiCsI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe src="https://codesandbox.io/embed/14w5j15kol?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

[Kiran](https://twitter.com/kiran_gaurang) wants to build a "circle with arcs"
chart, but he's having trouble. He asked for help so here we are :)

![](https://github.com/Swizec/datavizAdvent/raw/master/src/content/kiran-challenge/ask-for-help.png)

I livecoded this one from the Paris airport so there's no sound in the video. I
was too shy to narrate my actions in the middle of a busy Starbucks. Maybe next
time.

Anyway, to build an arc circle like this, we can take many cues from how you
would build a piechart. Arcs are still arcs: They're round, have an inner and
outer radius, and represent a datapoint. We can layer them on top of each other
with a band scale feeding into radiuses.

Like this 👇

## First you need a dataset

We fake the dataset because Kiran didn't provide one.

```javascript
// 5 percentages represent our dataset
const data = d3.range(5).map(_ => ({
  name: Faker.hacker.verb(),
  percentage: 75 * Math.random(),
}));
```

5 datapoints, fake name with faker, and a random chunk out of 75%. Tried going
full 100 at first and it didn't look great at all.

## Then you need a parent component

```javascript
const CircleArcs = ({ data, maxR }) => {
  const rScale = d3
    .scaleBand()
    .paddingInner(0.4)
    .paddingOuter(1)
    .domain(d3.range(data.length))
    .range([0, maxR]);

  return (
    <g>
      <Circle cx={0} cy={0} r={maxR} />
      {data.map((d, i) => (
        <Arc d={d} r={rScale(i)} width={rScale.bandwidth()} key={i} />
      ))}
    </g>
  );
};
```

A functional component will do. Create a band scale for the radiuses. Those cut
up a given space into equal bands and let you define padding. Same scale you'd
use for a barchart to position the bars.

The band scale is ordinal so our domain has to match the number of inputs,
`d3.range` takes care of that. For our dataset that sets the domain to
`[0,1,2,3,4]`.

Scale range goes from zero to max radius.

Render a `<Circle>` which is a styled circle component, loop through the data
and render an `<Arc>` component for each entry. The arc takes data in the `d`
prop, call `rScale` to get the radius, and use `rScale.bandwidth()` to define
the width. Band scales calculate optimal widths on their own.

We can use index for keys because we know arcs will never re-order.

## The parent component needs arcs

That's what it's rendering. They look like this

```javascript
const Arc = ({ d, r, width }) => {
  const arc = d3
    .arc()
    .innerRadius(r)
    .outerRadius(r + width)
    .startAngle(0)
    .endAngle((d.percentage / 100) * (Math.PI * 2));

  return (
    <g>
      <Label y={-r} x={-10}>
        {d.name}
      </Label>
      <ArcPath d={arc()} />
    </g>
  );
};
```

A D3 arc generator defines the path shape of our arcs. Inner radius comes from
the `r` prop, outer radius is `r+width`. Unlike a traditional pie chart, every
arc starts at angle zero.

The end angle makes our arcs communicate their value. A percentage of full
circle.

Each arc also comes with a label at its start. We position those at the
beginning of the arc using the `x` and `y` props. Setting their anchor point as
`end` automatically makes them _end_ at that point.

```javascript
const ArcPath = styled.path`
  fill: white;
`;

const Label = styled.text`
  fill: white;
  text-anchor: end;
`;
```

Styled components work great for setting pretty much any SVG prop 👌

And the result is a circle arc chart thing. Wonderful.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">For <a href="https://twitter.com/hashtag/ReactVizHoliday?src=hash&amp;ref_src=twsrc%5Etfw">#ReactVizHoliday</a> Day 14 we solved the <a href="https://twitter.com/kiran_gaurang?ref_src=twsrc%5Etfw">@kiran_gaurang</a> challenge: How do you build a arc circle chart thing<br><br>Solved live from the Paris airport because free wifi in France gets 3000kb/s upload 👌<br><br>👉 <a href="https://t.co/fKD856bWMp">https://t.co/fKD856bWMp</a> <a href="https://t.co/QwDAS7L63o">pic.twitter.com/QwDAS7L63o</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1076448516619362304?ref_src=twsrc%5Etfw">December 22, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<!--- end-lecture -->

<!--- begin-lecture title="Which emails sparked joy – an animated timeline" -->

![Which emails sparked joy?](https://i.imgur.com/iO6X09T.gif)

Ever wondered if the emails you send spark joy? You can ask!

About a year ago I started adding a little _"Did you like this?"_ form at the
bottom of emails sent to some 9,000 readers every week. The results have been
wonderful ❤️

I now know what lands and what doesn't with my audience and it's made me a
better writer. Here's an example where I wrote the same message in 2 different
ways, sent to the same audience.

https://twitter.com/Swizec/status/1156961114476797952

What a difference writing can make!

You know what makes data like this even better? A data visualization. With
hearts and emojis and transitions and stuff!

So I fired up the monthly dataviz stream and built one 😛

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">An entire dataviz from scratch. Data collection and all. Doing one of these epic streams every last Sunday of the month.<br><br>Article coming soon <a href="https://t.co/nZdWJPdyQt">pic.twitter.com/nZdWJPdyQt</a></p>&mdash; Swizec Teller (@Swizec) <a href="https://twitter.com/Swizec/status/1156226523403128833?ref_src=twsrc%5Etfw">July 30, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Watch the stream here 👇

<iframe width="560" height="315" src="https://www.youtube.com/embed/_Ja-mdt5tnQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/9Ue_6kEOblU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

It's a little long. Just over 5 hours. You might want to fast-forward a few
times, read this article instead. Think of it as a recap and full featured
tutorial.

Next lastish-Sunday-of-the-month you can join live. It's great fun :)

Here's how we approached this data visualization on the stream:

1. Collect data
2. See what we find
3. Design a visualization
4. Build with React & D3

I'm not so good at design methodology so we're going to focus on building and
data collection. Design happened through trial and error and a few ideas in my
head.

You can try it out live,
[here](https://newsletter-joy-dataviz-swizec.swizec-react-dataviz.now.sh)

<iframe src="https://newsletter-joy-dataviz-swizec.swizec-react-dataviz.now.sh" width="100%" height="500"></iframe>

Full
[code on GitHub](https://github.com/Swizec/reactfordataviz/tree/master/newsletter-dataviz)

## Collecting data

Our data comes from 2 sources:

1. [ConvertKit](https://convertkit.com/) for subscribers, emails, open rates,
   etc.
2. [TypeForm](https://www.typeform.com/) for sentiment about each email sent

We never ended up using ConvertKit subscriber data so I'm not gonna talk about
downloading and anonymizing that. You can see it in the stream.

ConvertKit and TypeForm APIs worked great for everything else.

### ConvertKit broadcasts/emails

ConvertKit calls the emails that you manually send to your subscribers
broadcasts. There's no built-in export for broadcast data so we used the API.

Since there's no ConvertKit library I could find, we built our own following
[the docs](https://developers.convertkit.com/#broadcasts). A few `fetch()`
calls and some JavaScript glue code.

```javascript
const fetch = require('node-fetch');
const { CK_KEY } = require('./secrets.json');
const fs = require('fs');

async function getBroadcasts() {
  const page1 = await fetch(
    `https://api.convertkit.com/v3/broadcasts?page=1&api_secret=${CK_KEY}`
  ).then(res => res.json());
  const page2 = await fetch(
    `https://api.convertkit.com/v3/broadcasts?page=2&api_secret=${CK_KEY}`
  ).then(res => res.json());

  const broadcasts = [...page1.broadcasts, ...page2.broadcasts];

  const result = [];

  for (let broadcast of broadcasts) {
    const stats = await fetch(
      `https://api.convertkit.com/v3/broadcasts/${
        broadcast.id
      }/stats?api_secret=${CK_KEY}`
    ).then(res => res.json());

    result.push({
      ...broadcast,
      ...stats.broadcast.stats,
    });
  }

  fs.writeFileSync('public/data/broadcasts.json', JSON.stringify(result));
}

getBroadcasts();
```

We make two API calls to get both pages of data. 50 results per page, just over
60 results in total. A real API wrapper would use some sort of loop here, but
for a quick hack this is fine.

Then we take the list of broadcasts and fetch stats for each. API gives us the
subject line, number of sends, opens, clicks, stuff like that.

We end up with a JSON file that contains all the email meta data we need for
our visualization.

```json
[{
    "id": 2005225,
    "created_at": "2019-01-14T18:17:04.000Z",
    "subject": "A bunch of cool things and neat little tips",
    "recipients": 10060,
    "open_rate": 22.24652087475149,
    "click_rate": 4.473161033797217,
    "unsubscribes": 32,
    "total_clicks": 993,
    "show_total_clicks": true,
    "status": "completed",
    "progress": 100
},
```

### TypeForm

![](https://i.imgur.com/oc3zSd7.png)

TypeForm data is best scraped with their API. They support CSV exports but
those work one by one. Manually going through all 60-some forms would take too
long.

Scraping was pretty easy though – there's an official JavaScript API client :)

```javascript
// scrape_typeform.js

const { createClient } = require("@typeform/api-client");
const fs = require("fs");

const typeformAPI = createClient({
    token: <API token>
});
```

Those few lines of code give us an API client. Documentation is a little weird
and you have to guess some naming conventions from the actual API docs, but we
made it work.

Fetching data happens in 3 steps:

1. Get list of workspaces, that's what TypeForm calls groups of forms
2. Get forms from all workspaces
3. Get responses to each form

```javascript
// scrape_typeform.js

async function scrapeData() {
  // fetches workspaces and filters the 2 we need
  const workspaces = await typeformAPI.workspaces
    .list({
      pageSize: 200,
    })
    .then(res =>
      res.items.filter(({ name }) => ['Post Emails', 'Emails'].includes(name))
    );

  // fires parallel requests to fetch forms for each workspace
  // Promise.all waits for every request to finish
  const allForms = await Promise.all(
    workspaces.map(({ id }) =>
      typeformAPI.forms
        .list({ workspaceId: id, pageSize: 200 })
        .then(forms => forms.items)
    )
  );

  // flatten list of lists of forms into a single list
  // remove any forms that are older than my first ConvertKit email
  const forms = allForms
    .reduce((acc, arr) => [...acc, ...arr], []) // node 10 doesn't have .flat
    .filter(f => new Date(f.last_updated_at) > START_DATE);

  // use the same Promise.all trick to fire parallel response requests
  const responses = await Promise.all(
    forms.map(form =>
      typeformAPI.responses
        .list({ pageSize: 200, uid: form.id })
        .then(res => ({ form: form.id, responses: res.items }))
    )
  );

  // write forms and responses as JSON files
  fs.writeFileSync('public/data/forms.json', JSON.stringify(forms));
  fs.writeFileSync('public/data/responses.json', JSON.stringify(responses));
}
```

A GraphQL API would make this much easier 😛

Again, this isn't the prettiest code but it's meant to run once so no need to
make it perfect. If you wanted to maintain this long-term, I'd recommend
breaking each step into its own function.

We end up with two JSON files containing all our sentiment data. The first
question, _"Did you like this?"_, is numeric and easy to interpret. The rest
contain words so we won't use them for our dataviz ... altho it would be cool
to figure something out.

## Setup the React app

Ok now we've got our data, time to fire up a new create-react-app, load the
data, and start exploring.

```
$ create-react-app newsletter-dataviz
$ cd newsletter-dataviz
$ yarn add d3 react-use-dimensions styled-components
```

We can work with a basic CRA app, no special requirements. Couple of
dependencies though:

- `d3` gives us simple data loading functions and helpers for calculating
  dataviz props
- `react-use-dimensions` or `useDimension` for short helps us make our dataviz
  responsive
- `styled-components` is my favorite way to use CSS in React apps

On the stream we did this part before scraping data so we had somewhere to
install dev dependencies. 😇

## Load data in the app

We want to load our dataset asynchronously on component mount. Helps our app
load fast, tell the user data is loading, and make sure all the data is ready
before we start drawing.

D3 comes with helpers for loading both CSV and JSON data so we don't have to
worry about parsing.

A custom `useDataset` hook helps us keep our code clean.

```javascript
// src/App.js

function useDataset() {
  const [broadcasts, setBroadcasts] = useState([]);

  useEffect(() => {
    (async function() {
      // data loading and parsing stuff
    })();
  }, []);

  return { broadcasts };
}
```

The `useDataset` hook keeps one state variable: `broadcasts`. We're going to
load all our data and combine it into a single data tree. Helps keep the rest
of our code simple.

Loading happens in that `useEffect`, which runs our async function immediately
on component mount.

### Load broadcasts

```javascript
// src/App.js
function useDataset() {
	// ...
	const broadcasts = await d3
	    .json("data/broadcasts.json")
	    .then(data =>
	        data
	            .map(d => ({
	                ...d,
	                created_at: new Date(d.created_at)
	            }))
	            .filter(d => d.recipients > 1000)
	            .filter(d => d.status === "completed")
	            .sort((a, b) => a.created_at - b.created_at)
	    );
```

Inside the effect we start with `broadcasts` data.

Use `d3.json` to make a fetch request and parse JSON data into a JavaScript
object. `.then` we iterate through the data and:

- change `created_at` strings into `Date` objects
- `filter` out any broadcasts smaller than 1000 recipients
- `filter` out any incomplete broadcasts
- `sort` by `created_at`

Always a good idea to perform all your data cleanup on load. Makes your other
code cleaner and you don't have to deal with strange edge cases.

### Load forms

```javascript
// src/App.js

function useDataset() {
	// ...
	let forms = await d3.json("data/forms.json");

	// associate forms with their respective email
	const dateId = Object.fromEntries(
	    broadcasts.map(d => [dateFormat(d.created_at), d.id])
	);

	forms = Object.fromEntries(
	    forms.map(form => [
	        form.id,
	        dateId[dateFormat(new Date(form.last_updated_at))]
	    ])
	);
```

Then we load the forms data using `d3.json` again.

This time we want to associate each form with its respective email based on
date. This approach works because I usually create the email and the form on
the same day.

We make heavy use of the `fromEntries` method. It takes lists `[key, value]`
pairs and turns them into `key: value` objects.

We end up with an object like this

```javascript
{
    dtnMgo: 2710510,
    G72ihG: 2694018,
    M6iSEQ: 2685890
		// ...
```

Form id mapping to email id.

### Load responses

```javascript
// src/App.js

function useDataset() {
	// ...
	let responses = await d3.json("data/responses.json");
	responses = responses
	    .map(row => ({
	        ...row,
	        broadcast_id: forms[row.form]
	    }))
	    .filter(d => d.broadcast_id !== undefined);

	setBroadcasts(
	    broadcasts.map(d => ({
	        ...d,
	        responses: responses.find(r => r.broadcast_id === d.id)
	    }))
	);
```

Finally we load our sentiment data – `responses.json`.

Use `d3.json` to get all responses, add a `broadcast_id` to each based on the
forms object, filter out anything with an undefined broadcast. Guess the "email
and broadcast on the same day" rule isn't perfect. 🤷‍♂️

While saving data in local state with `setBroadcasts`, we also map through
every entry and `.find` relevant responses. When we're done React re-renders
our app.

## Simplest way to show a Loading screen

Since we don't want users to stare at a blank screen while data loads, we
create the simplest of loading screens.

```javascript
// src/App.js

function App() {
    const { broadcasts } = useDataset();

    if (broadcasts.length < 1) {
        return <p>Loading data ...</p>;
    }

    // ...
```

Fire up the `useDataset` hook, take broadcasts data out, see if there's
anything yet. If there isn't render a `Loading data ...` text.

That is all ✌️

Since we're using a return, we'll have to make sure we add all hooks before
this part of the function. Otherwise you fall into conditional rendering and
hooks get confused. They have to be in the same order, always.

## Responsively render emails on a timeline

![](https://i.imgur.com/UV2TzvQ.png)

We render emails on a timeline with a combination of D3 scales and React
rendering loops. Each `💌` emoji represents a single email. Its size shows the
open rate.

Responsiveness comes from dynamically recalculating D3 scales based on the size
of our SVG element with the
[`useDimensions`](https://github.com/Swizec/useDimensions) hook.

```javascript
function App() {
    const { broadcasts } = useDataset();
    const [ref, { width, height }] = useDimensions();

    // ...

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(broadcasts, d => d.created_at))
        .range([30, width - 30]);

    const sizeScale = d3
        .scaleLinear()
        .domain(d3.extent(broadcasts, d => d.open_rate))
        .range([2, 25]);

    return (
        <svg ref={ref} width="99vw" height="99vh">
            {width &&
                height &&
                broadcasts
                    .map((d, i) => (
                        <Broadcast
                            key={d.id}
                            x={xScale(d.created_at)}
                            y={height / 2}
                            size={sizeScale(d.open_rate)}
                            data={d}
                        />
                    ))}
        </svg>
```

A couple steps going on here 👇

1. Get `ref`, `width`, and `height`, from `useDimensions`. The ref we'll use to
   specify what we're measuring. Width and height will update dynamically as
   the element's size changes on scroll or screen resize.
2. `xScale` is a D3 scale that maps `created_at` dates from our dataset to
   pixel values between `30` and `width-30`
3. `sizeScale` maps open rates from our dataset to pixel values between `2` and
   `25`
4. Render an `<svg>` element with the `ref` from useDimensions. Use width and
   height properties to make it full screen. When the browser resizes, this
   element will resize, useDimensions will pick up on that, update our `width`
   and `height`, trigger a re-render, and our dataviz becomes responsive 🤘
5. When all values are available `.map` through broadcast data and render a
   `<Broadcast>` component for each

### <Broadcast> component

The `<Broadcast>` component takes care of rendering and styling each letter
emoji on our visualization. Later it's going to deal with dropping hearts as
well.

We start with a `<CenteredText>` styled component.

```javascript
const CenteredText = styled.text`
  text-anchor: middle;
  dominant-baseline: central;
`;
```

Takes care of centering SVG text elements horizontally and vertically. Makes
positioning much easier.

Right now the `<Broadcast>` component just renders that.

```javascript
const Broadcast = ({ x, y, size, data }) => {
  return (
    <g transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}>
      <CenteredText x={0} y={0} fontSize={`${size}pt`}>
        💌
      </CenteredText>
    </g>
  );
};
```

Render a grouping element, `<g>`, use an SVG transform to position at `(x, y)`
coordinates, and render a `<CenteredText>` with a `💌` emoji using the `size`
prop for font size.

The result is a responsive timeline.

![](https://i.imgur.com/Z6MC3tV.gif)

## Animate the timeline

Animating the timeline is a sort of trick 👉 change `N` of rendered emails over
time and you get an animation.

We create a `useRevealAnimation` React hook to help us out.

```javascript
// src/App.js

function useRevealAnimation({ duration, broadcasts }) {
  const [N, setN] = useState(0);

  useEffect(() => {
    if (broadcasts.length > 1) {
      d3.selection()
        .transition('data-reveal')
        .duration(duration * 1000)
        .tween('Nvisible', () => {
          const interpolate = d3.interpolate(0, broadcasts.length);
          return t => setN(Math.round(interpolate(t)));
        });
    }
  }, [broadcasts.length]);

  return N;
}
```

We've got a local state for `N` and a `useEffect` to start the animation. The
effect starts a new D3 transition, sets up a custom tween with an interpolator
from `0` to `broadcasts.length` and runs `setN` with a new number on every tick
of the animation.

D3 handles the heavy lifting of figuring out exactly how to change `N` to
create a nice smooth animation.

I teach this approach in more detail as hybrid animation in my
[React for DataViz](https://reactfordataviz.com) course.

The `useRevealAnimation` hook goes in our `App` component like this 👇

```javascript
// src/App.js

function App() {
    const { broadcasts } = useDataset();
    const [ref, { width, height }] = useDimensions();
    const N = useRevealAnimation({ broadcasts, duration: 10 });

    // ...

            {width &&
                height &&
                broadcasts
                    .slice(0, N)
                    .map((d, i) => (
                        <Broadcast
```

`N` updates as the animation runs and `broadcasts.slice` ensures we render only
the first `N` elements of our data. React's diffing engine figures out the rest
so existing items don't re-render.

This avoid-re-rendering part is very important to create a smooth animation of
dropping hearts.

## Add dropping hearts

Each `<Broadcast>` handles its own dropping hearts.

```javascript
// src/Broadcast.js

const Broadcast = ({ x, y, size, data, onMouseOver }) => {
  const responses = data.responses ? data.responses.responses : [];

  // ratings > 3 are a heart, probably
  const hearts = responses
    .map(r => (r.answers ? r.answers.filter(a => a.type === 'number') : []))
    .flat()
    .filter(({ number }) => number > 3).length;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseOver={onMouseOver}
      style={{ cursor: 'pointer' }}
    >
      // ..
      <Hearts hearts={hearts} bid={data.id} height={y - 10} />
    </g>
  );
};
```

Get a list of `responses` out of data associated with each broadcast, flatten
into a simple array, and filter out any votes below `3` on the
`0, 1, 2, 3, 4, 5` scale. Assuming high numbers mean _"I liked this"_.

Render with a `<Hearts>` component.

### <Hearts> component

The `<Hearts>` component is a simple loop.

```javascript
// src/Broadcast.js

const Hearts = ({ bid, hearts, height }) => {
  return (
    <>
      {d3.range(0, hearts).map(i => (
        <Heart
          key={i}
          index={i}
          id={`${bid}-${i}`}
          height={height - i * 10}
          dropDuration={3}
        />
      ))}
    </>
  );
};
```

Create a counting array with `d3.range`, iterate over it, and render a
`<Heart>` for each. The `<Heart>` component declaratively takes care of
rendering itself so it drops into the right place.

### <Heart> component

```javascript
const Heart = ({ index, height, id, dropDuration }) => {
  const y = useDropAnimation({
    id,
    duration: dropDuration,
    height: height,
    delay: index * 100 + Math.random() * 75,
  });

  return (
    <CenteredText x={0} y={y} fontSize="12px">
      ❤️
    </CenteredText>
  );
};
```

Look at that, another animation hook. Hooks really simplify our code 🥰

The animation hook gives us a `y` coordinate. When that changes, the component
re-renders, and re-positions itself on the page.

That's because `y` is handled as a React state.

```javascript
// src/Broadcast.js

function useDropAnimation({ duration, height, id, delay }) {
  const [y, sety] = useState(0);

  useEffect(() => {
    d3.selection()
      .transition(`drop-anim-${id}`)
      .ease(d3.easeCubicInOut)
      .duration(duration * 1000)
      .delay(delay)
      .tween(`drop-tween-${id}`, () => {
        const interpolate = d3.interpolate(0, height);
        return t => sety(interpolate(t));
      });
  }, []);

  return y;
}
```

We're using the same hybrid animation trick as before except now we added an
easing function to our D3 transition so it looks better.

The result are hearts dropping from an animated timeline.

![](https://i.imgur.com/iO6X09T.gif)

## Add helpful titles

Last feature that makes our visualization useful are the titles. They create
context and tell users what they're looking at.

![](https://i.imgur.com/Le0Hj1M.png)

No dataviz trickery here, just helpful info in text form :)

```javascript
const Heading = styled.text`
  font-size: 1.5em;
  font-weight: bold;
  text-anchor: middle;
`;

const MetaData = ({ broadcast, x }) => {
  if (!broadcast) return null;

  // count likes
  // math the ratios for opens, clicks, etc

  return (
    <>
      <Heading x={x} y={50}>
        {broadcast ? dateFormat(broadcast.created_at) : null}
      </Heading>
      <Heading x={x} y={75}>
        {broadcast ? broadcast.subject : null}
      </Heading>
      <text x={x} y={100} textAnchor="middle">
        ❤️ {heartRatio.toFixed(0)}% likes 📖 {broadcast.open_rate.toFixed(0)}%
        reads 👆 {broadcast.click_rate.toFixed(0)}% clicks 😢{' '}
        {unsubRatio.toFixed(2)}% unsubs
      </text>
    </>
  );
};
```

We use some middle school maths to calculate the ratios we're showing, then
render a `<Heading>` styled component twice and a `<text>` component once.

Headings show the email date and title, text shows meta info about open rates
and such. Nothing fancy, but it makes the data visualization a lot better I
think.

## ❤️

<iframe src="https://newsletter-joy-dataviz-swizec.swizec-react-dataviz.now.sh" width="100%" height="500"></iframe>

And so we end up with a nice dataviz full of hearts and emojis and transitions
and animation. Great way to see which emails sparked joy 😍

Next step could be some sort of text analysis and figuring out which topics or
words correlate to more enjoyment. Could be fun but I don't think we have a big
enough dataset for proper sentiment analysis.

Maybe 🤔

Thanks for reading, <br>~Swizec

<!--- end-lecture -->

<!--- begin-lecture title="A barchart race visualizing Moore's Law" -->

[Moore's Law](https://en.wikipedia.org/wiki/Moore%27s_law) states that the
number of transistors on a chip roughly doubles every two years. But how does
that stack up against reality?

I was inspired by this
[data visualization of Moore's law](https://www.youtube.com/watch?v=7uvUiq_jTLM)
from @datagrapha going viral on Twitter and decided to replicate it in React
and D3.

[![](https://i.imgur.com/W3OVpFL.gif)](https://reactfordataviz.com/articles/moores-law/)

Some data bugs break it down in the end and there's something funky with Voodoo
Rush, but those transitions came out wonderful 👌

You can watch me build it from scratch, here 👇

https://www.youtube.com/watch?v=m34_D8Va-F4

First 30min eaten by a technical glitch 🤷‍♀️

Try it live in your browser, here 👉
[https://moores-law-swizec.swizec-react-dataviz.now.sh](https://moores-law-swizec.swizec-react-dataviz.now.sh)

And here's the
[full source code on GitHub](https://github.com/Swizec/moores-law).

_you can [Read this online](https://reactfordataviz.com/articles/moores-law/)_

# How it works

At its core Moore's Law in React & D3 is a bar chart flipped on its side.

We started with fake data and a React component that renders a bar chart. Then
we made the data go through time and looped through. The bar chart jumped
around.

So our next step was to add transitions. Made the bar chart look smooth.

Then we made our data gain an entry each year and created an enter transition
to each bar. Makes it smoother to see how new entries fly in.

At this point we had the building blocks and it was time to use real data. We
used [wikitable2csv](https://wikitable2csv.ggor.de/) to download data from
Wikipedia's [Transistor Count](https://en.wikipedia.org/wiki/Transistor_count)
page and fed it into our dataviz.

Pretty much everything worked right away 💪

## Start with fake data

Data visualization projects are best started with fake date. This approach lets
you focus on the visualization itself. Build the components, the transitions,
make it all fit together ... all without worrying about the exact shape of your
data.

Of course it's best if your fake data looks like your final dataset will.
Array, object, grouped by year, that sort of thing.

Plus you save time when you aren't waiting for large datasets to parse :)

Here's the fake data generator we used:

```javascript
// src/App.js

const useData = () => {
  const [data, setData] = useState(null);

  // Replace this with actual data loading
  useEffect(() => {
    // Create 5 imaginary processors
    const processors = d3.range(10).map(i => `CPU ${i}`),
      random = d3.randomUniform(1000, 50000);

    let N = 1;

    // create random transistor counts for each year
    const data = d3.range(1970, 2026).map(year => {
      if (year % 5 === 0 && N < 10) {
        N += 1;
      }

      return d3.range(N).map(i => ({
        year: year,
        name: processors[i],
        transistors: Math.round(random()),
      }));
    });

    setData(data);
  }, []);

  return data;
};
```

Create 5 imaginary processors, iterate over the years, and give them random
transistor counts. Every 5 years we increase the total `N` of processors in our
visualization.

We create data inside a `useEffect` to simulate that data loads asynchronously.

## Driving animation through the years

A large part of visualizing Moore's Law is showing its progression over the
years. Transistor counts increased as new CPUs and GPUs entered the market.

Best way to drive that progress animation is with a `useEffect` and a D3 timer.
We do that in our `App` component.

```javascript
// src/App.js

function App() {
    const data = useData();
    const [currentYear, setCurrentYear] = useState(1970);

    const yearIndex = d3
        .scaleOrdinal()
        .domain(d3.range(1970, 2025))
        .range(d3.range(0, 2025 - 1970));

    // Drives the main animation progressing through the years
    // It's actually a simple counter :P
    useEffect(() => {
        const interval = d3.interval(() => {
            setCurrentYear(year => {
                if (year + 1 > 2025) {
                    interval.stop();
                }

                return year + 1;
            });
        }, 2000);

        return () => interval.stop();
    }, []);
```

`useData()` runs our data generation custom hook. We `useState` for the current
year. A linear scale helps us translate from meaningful `1970` to `2026`
numbers to indexes in our data array.

The `useEffect` starts a `d3.interval`, which is like a `setInterval` but more
reliable. We update current year state in the interval callback.

Remember that state setters accept a function that gets current state as an
argument. Useful trick in this case where we don't want to restart the effect
on every year change.

We return `interval.stop()` as our cleanup function so React stops the loop
when our component unmounts.

## The basic render

Our main component renders a `<Barchart>` inside an `<Svg>`. Using styled
components for size and some layout.

```javascript
// src/App.js

return (
    <Svg>
        <Title x={"50%"} y={30}>
            Moore's law vs. actual transistor count in React & D3
        </Title>
        {data ? (
            <Barchart
                data={data[yearIndex(currentYear)]}
                x={100}
                y={50}
                barThickness={20}
                width={500}
            />
        ) : null}
        <Year x={"95%"} y={"95%"}>
            {currentYear}
        </Year>
    </Svg>
```

Our `Svg` is styled to take up the entire viewport and the `Year` component is
a big text.

The `<Barchart>` is where our dataviz work happens. From the outside it's a
component that takes "current data" and handles the rest. Positioning and
sizing props make it more reusable.

## A smoothly transitioning Barchart

[![](https://i.imgur.com/W3OVpFL.gif)](https://reactfordataviz.com/articles/moores-law/)

Our goal with the Barchart component was to:

- always render current state
- have smooth transitions on changes
- follow React-y principles
- easy to use from the outside

You can [watch the video](https://www.youtube.com/watch?v=m34_D8Va-F4) to see
how it evolved. Here I explain the final state 😇

### The <Barchart> component

The Barchart component takes in data, sets up vertical and horizontal D3
scales, and loops through data to render individual bars.

```javascript
// src/Barchart.js

// Draws the barchart for a single year
const Barchart = ({ data, x, y, barThickness, width }) => {
    const yScale = useMemo(
        () =>
            d3
                .scaleBand()
                .domain(d3.range(0, data.length))
                .paddingInner(0.2)
                .range([data.length * barThickness, 0]),
        [data.length, barThickness]
    );

    // not worth memoizing because data changes every time
    const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.transistors)])
        .range([0, width]);

    const formatter = xScale.tickFormat();
```

D3 scales help us translate between datapoints and pixels on a screen. I like
to memoize them when it makes sense.

Memoizing is particularly important with large datasets. You don't want to
waste time looking for the max in 100,000 elements on every render.

We were able to memoize `yScale` because `data.length` and `barThickness` don't
change _every_ time.

`xScale` on the other hand made no sense to memoize since we know `<Barchart>`
gets a new data object for every render. At least in theory.

We borrow xScale's tick formatter to help us render `10000` as `10,000`. Built
into D3 ✌️

**Rendering** our Barchart component looks like this:

```javascript
// src/Barchart.js

return (
  <g transform={`translate(${x}, ${y})`}>
    {data
      .sort((a, b) => a.transistors - b.transistors)
      .map((d, index) => (
        <Bar
          data={d}
          key={d.name}
          y={yScale(index)}
          width={xScale(d.transistors)}
          endLabel={formatter(d.transistors)}
          thickness={yScale.bandwidth()}
        />
      ))}
  </g>
);
```

A grouping element holds our bars together and moves them into place. Using a
group element changes the internal coordinate system so individual bars don't
have to know about overall positioning.

Just like in HTML when you position a div and its children don't need to know
:)

We sort data by transistor count and render a `<Bar>` element for each.
Individual bars get all needed info via props.

### The <Bar> component

Individual `<Bar>` components render a rectangle flanked on each side by a
label.

```javascript
return (
  <g transform={`translate(${renderX}, ${renderY})`}>
    <rect x={10} y={0} width={renderWidth} height={thickness} fill={color} />
    <Label y={thickness / 2}>{data.name}</Label>
    <EndLabel y={thickness / 2} x={renderWidth + 15}>
      {data.designer === 'Moore'
        ? formatter(Math.round(transistors))
        : formatter(data.transistors)}
    </EndLabel>
  </g>
);
```

A grouping element groups the 3 elements, styled components style the labels,
and a `rect` SVG element creates the rectangle. Simple React markup stuff ✌️

Where the `<Bar>` component gets interesting is the positioning. We use
`renderX` and `renderY` even though the vertical position comes from props as
`y` and `x` is static.

That's got to do with transitions.

### Transitions

The `<Bar>` component uses the hybrid animation approach from my
[React For DataViz](https://reactfordataviz.com) course.

A key insight is that we use _independent_ transitions on each axis to create a
_coordinated_ transition. Both for entering into the chart and for moving
around later.

Special case for the `Moore's Law` bar itself where we also transition the
label so it looks like it's counting.

We created a `useTransition` custom hook to make our code easier to understand
and cleaner to read.

#### useTransition

The `useTransition` custom hook helps us move values from props to state. State
becomes the staging area and props are the target we want to reach.

To run a transition we create an effect and set up a D3 transition. On each
tick of the animation we update state proportionately to time spent animating.

```javascript
const useTransition = ({ targetValue, name, startValue, easing }) => {
  const [renderValue, setRenderValue] = useState(startValue || targetValue);

  useEffect(() => {
    d3.selection()
      .transition(name)
      .duration(2000)
      .ease(easing || d3.easeLinear)
      .tween(name, () => {
        const interpolate = d3.interpolate(renderValue, targetValue);
        return t => setRenderValue(interpolate(t));
      });
  }, [targetValue]);

  return renderValue;
};
```

State update happens inside that custom `.tween` method. We interpolate between
the current value and the target value.

D3 handles the rest.

#### Using useTransition

We can reuse that same transition approach for each independent axis we want to
animate. D3 makes sure all transitions start at the same time and run at the
same pace. Any dropped frames or browser slow downs are handled for us.

```javascript
// src/Bar.js
const Bar = ({ data, y, width, thickness, formatter, color }) => {
    const renderWidth = useTransition({
        targetValue: width,
        name: `width-${data.name}`,
        easing: data.designer === "Moore" ? d3.easeLinear : d3.easeCubicInOut
    });
    const renderY = useTransition({
        targetValue: y,
        name: `y-${data.name}`,
        startValue: -500 + Math.random() * 200,
        easing: d3.easeCubicInOut
    });
    const renderX = useTransition({
        targetValue: 0,
        name: `x-${data.name}`,
        startValue: 1000 + Math.random() * 200,
        easing: d3.easeCubicInOut
    });
    const transistors = useTransition({
        targetValue: data.transistors,
        name: `trans-${data.name}`,
        easing: d3.easeLinear
    });
```

Each transition returns the current value for the transitioned axis.
`renderWidth`, `renderX`, `renderY`, and even `transistors`.

When a transition updates, its internal `useState` setter runs. That triggers a
re-render and updates the value in our `<Bar>` component, which then
re-renders.

Because D3 transitions run at 60fps, we get a smooth animation ✌️

Yes that's a lot of state updates for each frame of animation. At least 4 per
frame per datapoint. About 4\*60\*298 = 71,520 per second at max.

And React can handle it all. At least on my machine, I haven't tested elsewhere
yet :)

## Conclusion

And that's how you can combine React & D3 to get a smoothly transitioning
barchart visualizing Moore's Law through the years.

[![](https://i.imgur.com/W3OVpFL.gif)](https://moores-law-swizec.swizec-react-dataviz.now.sh/)

Key takeaways:

- React for rendering
- D3 for data loading
- D3 runs and coordinates transitions
- state updates drive re-rendering animation
- build custom hooks for common setup

Cheers,<br> ~Swizec

<!--- end-lecture -->

<!--- begin-lecture title="Building a Piet Mondrian art generator with treemaps" -->

> "lol you can become a famous artist by just painting colorful squares"

Yeah turns out generative art is really hard. And Mondrian did it manually.

[![](https://i.imgur.com/9czz3FL.gif)](https://mondrian-generator.swizec-react-dataviz.now.sh/)

[Piet Mondrian](https://en.wikipedia.org/wiki/Piet_Mondrian) was a Dutch
painter famous for his style of grids with basic squares and black lines. So
famous in fact, Google finds him as
["squares art guy"](https://www.google.com/search?q=squares+art+guy&oq=squares+art+guy&aqs=chrome..69i57.3689j0j1&sourceid=chrome&ie=UTF-8).

The signature style grew out of his earlier cubist works seeking a universal
beauty understood by a all humans.

> I believe it is possible that, through horizontal and vertical lines
> constructed with awareness, but not with calculation, led by high intuition,
> and brought to harmony and rhythm, these basic forms of beauty, supplemented
> if necessary by other direct lines or curves, can become a work of art, as
> strong as it is true.

![An early cubist work by Piet Mondrian](https://upload.wikimedia.org/wikipedia/commons/8/80/Piet_Mondrian%2C_1911%2C_Gray_Tree_%28De_grijze_boom%29%2C_oil_on_canvas%2C_79.7_x_109.1_cm%2C_Gemeentemuseum_Den_Haag%2C_Netherlands.jpg)

So I figured what better way to experiment with
[D3 treemaps](https://observablehq.com/@d3/treemap) than to pay an homage to
this great artist.

You can watch the full live stream here:

https://www.youtube.com/watch?v=6Ad0I8RZhY8

GitHub link here 👉
[Swizec/mondrian-generator](https://github.com/Swizec/mondrian-generator)

And try it out
[in your browser](https://mondrian-generator.swizec-react-dataviz.now.sh/)

It's not as good as Mondrian originals, but we learned a lot 👩‍🎨

You can read this article online at
[reactfordataviz.com/articles/mondrian-art-generator/](https://reactfordataviz.com/articles/mondrian-art-generator/)

## What is a treemap anyway?

[![A treemap built with D3](https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/treemap.png)](https://www.npmjs.com/package/d3-hierarchy)

> Introduced by Ben Shneiderman in 1991, a treemap recursively subdivides area
> into rectangles according to each node’s associated value.

In other words, a treemap takes a rectangle and packs it with smaller
rectangles based on a tiling algorithm. Each rectangle's area is proportional
to the value it represents.

Treemaps are most often used for presenting budgets and other relative sizes.
Like in this interactive
[example of a government budget from 2016](https://obamawhitehouse.archives.gov/interactive-budget).

![](https://i.imgur.com/YzOsWfp.png)

You can see at a glance most of the money goes to social security, then health
care, which is split between medicaid, children's health, etc.

Treemaps are great for recursive data like that.

## Using a D3 treemap to generate art with React

We wanted to play with treemaps per a reader's request, but couldn't find an
interesting dataset to visualize. _Generating_ data was the solution.
Parametrizing it with sliders, pure icing on the cake.

Also I was curious how close we can get :)

3 pieces have to work together to produce an interactive piece of art:

1. A recursive rendering component
2. A function that generates treemappable data
3. Sliders that control inputs to the function

### A recursive rendering component

Treemaps are recursive square subdivisions. They come with a bunch of tiling
algorithms, the most visually stunning of which is the
[squarified treemaps](https://www.win.tue.nl/~vanwijk/stm.pdf) algorithm
described in 2000 by Dutch researchers.

What is it with Dutch people and neat squares 🤔

While beautiful, the squarified treemaps algorithm did not look like a
Mondrian.

![Squarified treemap of our Mondrian function](https://i.imgur.com/sw6pO2r.png)

Subtle difference, I know, but squarified treemaps are based on the
[golden ratio](https://en.wikipedia.org/wiki/Golden_ratio) and Piet Mondrian's
art does not look like that. We used the `d3.treemapBinary` algorithm instead.
It aims to create a balanced binary tree.

#### main `<Mondrian>` component

```javascript
// src/Mondrian.js

const Mondrian = ({ x, y, width, height, data }) => {
  const treemap = d3
    .treemap()
    .size([width, height])
    .padding(5)
    .tile(d3.treemapBinary);

  const root = treemap(
    hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => 0.5 - Math.random())
  );

  return (
    <g transform={`translate(${x}, ${y})`}>
      <MondrianRectangle node={root} />
    </g>
  );
};
```

The `<Mondrian>` component takes some props and instantiates a new treemap
generator. We could've wrapped this in a `useMemo` call for better performance,
but it seemed fast enough.

We set the treemap's `size()` from width and height props, a guessed
`padding()` of 5 pixels, and a tiling algorithm.

This creates a `treemap()` generator – a method that takes data and returns
that same data transformed with values used for rendering.

The generator takes a [d3-hierarchy](https://github.com/d3/d3-hierarchy), which
is a particular data format shared by all hierarchical rendering generators in
the D3 suite. Rather than build it ourselves, we feed our source data into the
`hierarchy()` method. That cleans it up for us ✌️

We need the `sum()` method to tell the hierarchy how to sum up the values of
our squares, and we use random sorting because that produced nicer results.

#### a `<MondrianRectangle>` component for each square

We render each level of the resulting treemap with a `<MondrianRectangle>`
component.

```javascript
// src/Mondrian.js

const MondrianRectangle = ({ node }) => {
  const { x0, y0, x1, y1, children } = node,
    width = x1 - x0,
    height = y1 - y0;

  return (
    <>
      <rect
        x={x0}
        y={y0}
        width={width}
        height={height}
        style={
          fill: node.data.color,
          stroke: "black",
          strokeWidth: 5
        }
        onClick={() => alert(`This node is ${node.data.color}`)}
      />
      {children &&
        children.map((node, i) => <MondrianRectangle node={node} key={i} />)}
    </>
  );
};
```

Each rectangle gets a `node` prop with a bunch of useful properties.

- `x0, y0` defines the top left corner
- `x1, y1` is the bottom right corner
- `children` are the child nodes from our hierarchy

We render an SVG `<rect>` component as the square representing _this_ node. Its
children we render by looping through the `children` array and recursively
rendering a `<MondrianRectangle>` component for each.

The `onClick` is there just to show how you might make these interactive :)

> You can use this same principle to render any data with a treemap.

### A Mondrian data generator method

We moved the generative art piece into a custom `useMondrianGenerator` hook.
Keeps our code cleaner 😌

```javascript
// src/App.js

let mondrian = useMondrianGenerator({
  redRatio,
  yellowRatio,
  blueRatio,
  blackRatio,
  subdivisions,
  maxDepth,
});
```

The method takes a bunch of arguments that act as weights on randomly generated
parameters. Ideally we'd create a stable method that always produces the same
result for the same inputs, but that proved difficult.

As mentioned earlier, generative art is _hard_ so this method is gnarly. 😇

#### Weighed random color generator

We start with a weighed random generator.

```javascript
// src/useMondrianGenerator.js

// Create weighted probability distribution to pick a random color for a square
const createColor = ({ redRatio, blueRatio, yellowRatio, blackRatio }) => {
  const probabilitySpace = [
    ...new Array(redRatio * 10).fill('red'),
    ...new Array(blueRatio * 10).fill('blue'),
    ...new Array(yellowRatio * 10).fill('yellow'),
    ...new Array(blackRatio * 10).fill('black'),
    ...new Array(
      redRatio * 10 + blueRatio * 10 + yellowRatio * 10 + blackRatio * 10
    ).fill('#fffaf1'),
  ];

  return d3.shuffle(probabilitySpace)[0];
};
```

`createColor` picks a color to use for each square. It takes desired ratios of
different colors and uses a trick I discovered in college. There are probably
better ways to create a [weighed random method, but this works well and is
something I can understand.

You create an array with the amount of values proportional to the probabilities
you want. If you want `red` to be twice as likely as `blue`, you'd use an array
like `[red, red, blue]`.

Pick a random element from that array and you get values based on
probabilities.

The result is a `createColor` method that returns colors in the correct ratio
without knowing context of what's already been picked and what hasn't. ✌️

#### generating mondrians

The `useMondrianGenerator` hook itself is pretty long. I'll explain in code
comments so it's easier to follow along :)

```javascript
// src/useMondrianGenerator.js

// Takes inputs and spits out mondrians
function useMondrianGenerator({
  redRatio,
  yellowRatio,
  blueRatio,
  blackRatio,
  subdivisions,
  maxDepth,
}) {
  // useMemo helps us avoid recalculating this all the time
  // saves computing resources and makes the art look more stable
  let mondrian = useMemo(() => {
    // calculation is wrapped in a method so we can use recursion
    // each level gets the current "value" that is evenly split amongst children
    // we use depth to decide when to stop
    const generateMondrian = ({ value, depth = 0 }) => {
      // each level gets a random number of children based on the subdivisions argument
      const N = Math.round(1 + Math.random() * (subdivisions * 10 - depth));

      // each node contains:
      // its value, used by treemaps for layouting
      // its color, used by <MondrianRectangle> for the color
      // its children, recursively generated based on the number of children
      return {
        value,
        color: createColor({
          redRatio,
          yellowRatio,
          blueRatio,
          blackRatio,
        }),
        children:
          // this check helps us stop when we need to
          // d3.range generates an empty array of length N that we map over to create children
          depth < maxDepth * 5
            ? d3.range(N).map(_ =>
                generateMondrian({
                  value: value / N,
                  depth: depth + 1,
                })
              )
            : null,
      };
    };

    // kick off the recursive process with a value of 100
    return generateMondrian({
      value: 100,
    });
    // regenerate the base data when max depth or rate of subdivisions change
  }, [maxDepth, subdivisions]);

  // Iterate through all children and update colors when called
  const updateColors = node => ({
    ...node,
    color: createColor({
      redRatio,
      yellowRatio,
      blueRatio,
      blackRatio,
    }),
    children: node.children ? node.children.map(updateColors) : null,
  });

  // useMemo again helps with stability
  // We update colors in our dataset whenever those ratios change
  // depending on subdivisions and maxDepth allows the data update from that earlier useMemo to propagate
  mondrian = useMemo(() => updateColors(mondrian), [
    redRatio,
    yellowRatio,
    blueRatio,
    blackRatio,
    subdivisions,
    maxDepth,
  ]);

  return mondrian;
}
```

And that creates mondrian datasets based on inputs. Now we just need the
inputs.

### Sliders for function inputs

Thanks to React Hooks, our sliders were pretty easy to implement. Each controls
a ratio for a certain value fed into a random data generation method.

Take the slider that controls the ratio of red squares for example.

It starts life as a piece of state in the `<App>` component.

```javascript
// src/App.js

const [redRatio, setRedRatio] = useState(0.2);
```

`redRatio` is the value, `setRedRatio` is the value setter, `0.2` is the
initial value.

Render the slider as a `<Range>` component.

```javascript
// src/App.js

<Range name="red" value={redRatio} onChange={setRedRatio} />
```

Value comes from our state, update state on change.

The `<Range>` component itself looks like this:

```javascript
// src/App.js

const Range = ({ name, value, onChange }) => {
  return (
    <div style={ display: "inline-block" }>
      {name}
      <br />
      <input
        type="range"
        name={name}
        min={0}
        max={1}
        step={0.1}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
    </div>
  );
};
```

HTML has built-in sliders so we don't have to reinvent the wheel. Render an
input, give it a `type="range"`, set value from our prop, and parse the event
value in `onChange` before feeding it back to `setRedRange` with our callback.

Now each time you move that slider, it triggers a re-render, which generates a
new Mondrian from the data.

[![](https://i.imgur.com/9czz3FL.gif)](https://mondrian-generator.swizec-react-dataviz.now.sh/)

## Conclusion

In conclusion: generative art is hard, Piet Mondrian was brillianter than he
seems, and D3 treemaps are great fun.

Hope you enjoyed this as much as I did :)

Cheers,<br> ~Swizec

<!--- end-lecture -->

<!--- end-section -->