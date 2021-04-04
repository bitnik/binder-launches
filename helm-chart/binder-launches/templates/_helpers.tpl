{{/*
Expand the name of the chart.
*/}}
{{- define "binder-launches.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "binder-launches.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "binder-launches.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "binder-launches.labels" -}}
helm.sh/chart: {{ include "binder-launches.chart" . }}
{{ include "binder-launches.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "binder-launches.selectorLabels" -}}
app.kubernetes.io/name: {{ include "binder-launches.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create database url
*/}}
{{- define "binder-launches.dbURL" }}
{{- with .Values.db }}
{{- required "A db username (.Values.db.username) is required!" .username }}:
{{- required "A db password (.Values.db.password) is required!" .password }}@
{{- required "A db host (.Values.db.host) is required!" .host }}:
{{- required "A db port (.Values.db.port) is required!" .port }}/
{{- required "A database name (.Values.db.database) is required!" .database }}
{{- end }}
{{- end }}
