<html>
<body>
<h2>Releases</h2>
<table>
  <tr>
    <th>release</th>
    <th>date</th>
  </tr>
  {% assign charts = site.data.index.entries.binder-launches | sort: 'created' | reverse %}
  {% for chart in charts %}
    <tr>
      <td>
      <a href="{{ chart.urls[0] }}">
          {{ chart.name }}-{{ chart.version }}
      </a>
      </td>
      <td>
      <span class='date'>{{ chart.created | date_to_rfc822 }}</span>
      </td>
    </tr>
  {% endfor %}
</table>
</body>
</html>
