/*
 * Copyright (C) 2011 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import I18n from 'i18n!course_settings'
import $ from 'jquery'
import _ from 'underscore'
import {tabIdFromElement} from 'course_settings_helper'
import tz from 'timezone'
import forceScreenReaderToReparse from 'jsx/shared/helpers/forceScreenreaderToReparse'
import './jquery.ajaxJSON'
import './jquery.instructure_date_and_time' /* datetimeString, date_field */
import './jquery.instructure_forms' /* formSubmit, fillFormData, getFormData, formErrors */
import 'jqueryui/dialog'
import 'compiled/jquery/fixDialogButtons'
import './jquery.instructure_misc_plugins' /* confirmDelete, fragmentChange, showIf */
import './jquery.keycodes'
import './jquery.loadingImg'
import 'compiled/jquery.rails_flash_notifications'
import './jquery.templateData' /* fillTemplateData, getTemplateData */
import './link_enrollment' /* global link_enrollment */
import 'vendor/jquery.ba-tinypubsub' /* /\.publish/ */
import './vendor/jquery.scrollTo'
import 'jqueryui/autocomplete'
import 'jqueryui/sortable'
import 'jqueryui/tabs'

  var GradePublishing = {
    status: null,
    checkup: function () {
      $.ajaxJSON($("#publish_to_sis_form").attr('action'), 'GET', {}, function(data) {
        if (!data.hasOwnProperty("sis_publish_overall_status")) return;
        GradePublishing.status = data.sis_publish_overall_status;
        GradePublishing.update(data.hasOwnProperty("sis_publish_statuses") ? data.sis_publish_statuses : {});
      });
    },
    update: function(messages, requestInProgress) {
      var $publish_grades_link = $("#publish_grades_link"),
          $publish_grades_error = $("#publish_grades_error");
      if (GradePublishing.status == 'published') {
        $publish_grades_error.hide();
        $publish_grades_link.text(I18n.t('Resync grades to SIS'));
        $publish_grades_link.removeClass("disabled");
      } else if (GradePublishing.status == 'publishing' || GradePublishing.status == 'pending') {
        $publish_grades_error.hide();
        $publish_grades_link.text(I18n.t('Syncing grades to SIS...'));
        if (!requestInProgress) {
          setTimeout(GradePublishing.checkup, 5000);
        }
        $publish_grades_link.addClass("disabled");
      } else if (GradePublishing.status == 'unpublished') {
        $publish_grades_error.hide();
        $publish_grades_link.text(I18n.t('Sync grades to SIS'));
        $publish_grades_link.removeClass("disabled");
      } else {
        $publish_grades_error.show();
        $publish_grades_link.text(I18n.t('Resync grades to SIS'));
        $publish_grades_link.removeClass("disabled");
      }
      var $messages = $("#publish_grades_messages");
      $messages.empty();
      $.each(messages, function(message, users) {
        var $message = $("<span/>");
        $message.text(message);
        var $item = $("<li/>");
        $item.append($message);
        $item.append(" - <b>" + users.length + "</b>");
        $messages.append($item);
      });
    },
    publish: function() {
      var confirmMessage;
      if (GradePublishing.status == 'publishing' || GradePublishing.status == 'pending' || GradePublishing.status == null) {
        return;
      }

      confirmMessage = GradePublishing.status === 'published' ?
        I18n.t('Are you sure you want to resync these grades to the student information system?') :
        I18n.t('Are you sure you want to sync these grades to the student information system? You should only do this if all your grades have been finalized.');

      if (!confirm(confirmMessage)) {
        return;
      }

      var $publish_to_sis_form = $("#publish_to_sis_form");
      GradePublishing.status = "publishing";
      GradePublishing.update({}, true);
      var successful_statuses = { "published": 1, "publishing": 1, "pending": 1 };
      var error = function(data, xhr, status, error) {
        GradePublishing.status = "unknown";
        $.flashError(I18n.t('Something went wrong when trying to sync grades to the student information system. Please try again later.'));
        GradePublishing.update({});
      };
      $.ajaxJSON($publish_to_sis_form.attr('action'), 'POST', $publish_to_sis_form.getFormData(), function(data) {
        if (!data.hasOwnProperty("sis_publish_overall_status") || !successful_statuses.hasOwnProperty(data["sis_publish_overall_status"])) {
          error(null, null, I18n.t('Invalid SIS sync status'), null);
          return;
        }
        GradePublishing.status = data.sis_publish_overall_status;
        GradePublishing.update(data.hasOwnProperty("sis_publish_statuses") ? data.sis_publish_statuses : {});
      }, error);
    }
  }

  $(document).ready(function() {
    var $add_section_form = $("#add_section_form"),
        $edit_section_form = $("#edit_section_form"),
        $course_form = $("#course_form"),
        $enrollment_dialog = $("#enrollment_dialog"),
        $tabBar = $("#course_details_tabs"),
        // as of jqueryui 1.9, the cookie trumps the fragment :(. so we hack
        // around that here
        initialTab = _.indexOf(_.pluck($tabBar.find('> ul a'), 'hash'), location.hash);

    $tabBar.tabs({cookie: {}, active: initialTab >= 0 ? initialTab : null}).show();

    $add_section_form.formSubmit({
      required: ['course_section[name]'],
      beforeSubmit: function(data) {
        $add_section_form.find("button").attr('disabled', true).text(I18n.t('buttons.adding_section', "Adding Section..."));
      },
      success: function(data) {
        var section = data.course_section,
            $section = $(".section_blank:first").clone(true).attr('class', 'section'),
            $option = $("<option/>");

        $add_section_form.find("button").attr('disabled', false).text(I18n.t('buttons.add_section', "Add Section"));
        $section.fillTemplateData({
          data: section,
          hrefValues: ['id']
        });
        $section.find('.screenreader-only').each(function(_index, el) {
          var $el = $(el);
          $el.text($el.text().replace('%%name%%', section.name));
        });
        $("#course_section_id_holder").show();
        $option.val(section.id).text(section.name).addClass('option_for_section_' + section.id);
        $("#sections .section_blank").before($section);
        $section.slideDown();
        $("#course_section_name").val();
        $('#add_section_form button[type="submit"]').focus();
      },
      error: function(data) {
        $add_section_form
          .formErrors(data)
          .find("button").attr('disabled', false).text(I18n.t('errors.section', "Add Section Failed, Please Try Again"));
      }
    });
    $(".cant_delete_section_link").click(function(event) {
      alert($(this).attr('title'));
      return false;
    });
    $edit_section_form.formSubmit({
      beforeSubmit: function(data) {
        $edit_section_form.hide();
        var $section = $edit_section_form.parents(".section");
        $section.find(".name").text(data['course_section[name]']).show();
        $section.loadingImage({image_size: "small"});
        return $section;
      },
      success: function(data, $section) {
        var section = data.course_section;
        $section.loadingImage('remove');
        $(".option_for_section_" + section.id).text(section.name);
        this.parent().find('.edit_section_link').focus();
      },
      error: function(data, $section) {
        $section.loadingImage('remove').find(".edit_section_link").click();
        $edit_section_form.formErrors(data);
        this.find('#course_section_name_edit').focus();
      }
    })
    .find(":text")
      .bind('blur', function() {
        $edit_section_form.submit();
      })
      .keycodes('return esc', function(event) {
        if(event.keyString == 'return') {
          $edit_section_form.submit();
        } else {
          $(this).parents(".section").find(".name").show();
          $("body").append($edit_section_form.hide());
        }
      });
    $(".edit_section_link").click(function() {
      var $this = $(this),
          $section = $this.parents(".section"),
          data = $section.getTemplateData({textValues: ['name']});
      $edit_section_form.fillFormData(data, {object_name: "course_section"});
      $section.find(".name").hide().after($edit_section_form.show());
      $edit_section_form.attr('action', $this.attr('href'));
      $edit_section_form.find(":text:first").focus().select();
      return false;
    });
    $(".delete_section_link").click(function() {
      $(this).parents(".section").confirmDelete({
        url: $(this).attr('href'),
        message: I18n.t('confirm.delete_section', "Are you sure you want to delete this section?"),
        success: function(data) {
          var $prevItem = $(this).prev();
          var $toFocus = $prevItem.length ?
            $prevItem.find('.delete_section_link,.cant_delete_section_link') :
            $("#sections_tab > a");
          $(this).slideUp(function() {
            $(this).remove();
            $toFocus.focus();
          });
        }
      });
      return false;
    });
    $("#nav_form").submit(function(){
      var tab_id_regex = /(\d+)$/;

      var tabs = [];
      $("#nav_enabled_list li").each(function() {
        var tab_id = tabIdFromElement(this);
        if (tab_id !== null) { tabs.push({ id: tab_id }); }
      });
      $("#nav_disabled_list li").each(function() {
        var tab_id = tabIdFromElement(this);
        if (tab_id !== null) { tabs.push({ id: tab_id, hidden: true }); }
      });

      $("#tabs_json").val(JSON.stringify(tabs));
      return true;
    });

    $(".edit_nav_link").click(function(event) {
      event.preventDefault();
      $("#nav_form").dialog({
        modal: true,
        resizable: false,
        width: 400
      });
    });

    $("#nav_enabled_list, #nav_disabled_list").sortable({
      items: 'li.enabled',
      connectWith: '.connectedSortable',
      axis: 'y'
    }).disableSelection();

    $(document).fragmentChange(function(event, hash) {
      function handleFragmentType(val){
        $("#tab-users-link").click();
        $(".add_users_link:visible").click();
        $("#enroll_users_form select[name='enrollment_type']").val(val);
      }
      if(hash == "#add_students") {
        handleFragmentType("StudentEnrollment");
      } else if(hash == "#add_tas") {
        handleFragmentType("TaEnrollment");
      } else if(hash == "#add_teacher") {
        handleFragmentType("TeacherEnrollment");
      }
    });
    $("#course_account_id_lookup").autocomplete({
      source: $("#course_account_id_url").attr('href'),
      select: function (event, ui) {
        $("#course_account_id").val(ui.item.id);
      }
    });
    $(".move_course_link").click(function(event) {
      event.preventDefault();
      $("#move_course_dialog").dialog({
        title: I18n.t('titles.move_course', "Move Course"),
        width: 500
      }).fixDialogButtons();
    });
    $("#move_course_dialog").delegate('.cancel_button', 'click', function() {
      $("#move_course_dialog").dialog('close');
    });
    $course_form.find(".grading_standard_checkbox").change(function() {
      $course_form.find(".grading_standard_link").showIf($(this).attr('checked'));
    }).change();
    $course_form.find("#course_conclude_at").change(function() {
      var $warning = $course_form.find("#course_conclude_at_warning");
      var $parent = $(this).parent();
      var date = $(this).data('unfudged-date');
      var isMidnight = tz.isMidnight(date);
      $warning.detach().appendTo($parent).showIf(isMidnight);
    });
    $course_form.formSubmit({
      beforeSubmit: function(data) {
        $(this).loadingImage();
        $(this).find(".readable_license,.account_name,.term_name,.grading_scheme_set").text("...");
        $(this).find(".storage_quota_mb").text(data['course[storage_quota_mb]']);
        $(".course_form_more_options").hide();
      },
      success: function(data) {
        $('#course_reload_form').submit();
      },
      error: function(data) {
        $(this).loadingImage('remove');
      },
      disableWhileLoading: 'spin_on_success'
    })
    $(".associated_user_link").click(function(event) {
      event.preventDefault();
      var $user = $(this).parents(".user");
      var $enrollment = $(this).parents(".enrollment_link");
      var user_data = $user.getTemplateData({textValues: ['name']});
      var enrollment_data = $enrollment.getTemplateData({textValues: ['enrollment_id', 'associated_user_id']});
      link_enrollment.choose(user_data.name, enrollment_data.enrollment_id, enrollment_data.associated_user_id, function(enrollment) {
        if(enrollment) {
          var $user = $(".observer_enrollments .user_" + enrollment.user_id)
          var $enrollment_link = $user.find(".enrollment_link.enrollment_" + enrollment.id)
          $enrollment_link.find(".associated_user.associated").showIf(enrollment.associated_user_id)
          $enrollment_link.fillTemplateData({data: enrollment});
          $enrollment_link.find(".associated_user.unassociated").showIf(!enrollment.associated_user_id);
        }
      });
    });
    $(".course_info").not('.uneditable').click(function(event) {
      if (event.target.nodeName == "INPUT") {
        return;
      }
      var $obj = $(this).parents("td").find(".course_form");
      if($obj.length) {
        $obj.focus().select();
      }
    });
    $(".course_form_more_options_link").click(function(event) {
      event.preventDefault();
      var $moreOptions = $(".course_form_more_options");
      var optionText = $moreOptions.is(':visible') ? I18n.t('links.more_options', 'more options') : I18n.t('links.fewer_options', 'fewer options');
      $(this).text(optionText);
      const csp = document.getElementById('csp_options')
      if (csp)  {
        Promise.all([
          import('axios'),
          import('react-dom'),
          import('react'),
          import('jsx/course_settings/components/CSPSelectionBox')
        ])
        .then(([{default: axios}, ReactDOM, React, {default: CSPSelectionBox}]) => {
          ReactDOM.render(
            <CSPSelectionBox
              courseId={ENV.COURSE_ID}
              canManage={ENV.PERMISSIONS.manage_account_settings}
              apiLibrary={axios}
            />, csp
          )
        }).catch(()=> {
          // We shouldn't get here, but if we do... do something.
          const $message = $('<div />').text(I18n.t('Setting failed to load, try refreshing.'))
          $(csp).append($message)
        })
      }
      $moreOptions.slideToggle();
    });
   $enrollment_dialog.find(".cancel_button").click(function() {
      $enrollment_dialog.dialog('close');
    });

    $enrollment_dialog.find(".re_send_invitation_link").click(function(event) {
      event.preventDefault();
      var $link = $(this);
      $link.text(I18n.t('links.re_sending_invitation', "Re-Sending Invitation..."));
      var url = $link.attr('href');
      $.ajaxJSON(url, 'POST', {}, function(data) {
        $enrollment_dialog.fillTemplateData({data: {invitation_sent_at: I18n.t('invitation_sent_now', "Just Now")}});
        $link.text(I18n.t('invitation_sent', "Invitation Sent!"));
        var $user = $enrollment_dialog.data('user');
        if($user) {
          $user.fillTemplateData({data: {invitation_sent_at: I18n.t('invitation_sent_now', "Just Now")}});
        }
      }, function(data) {
        $link.text(I18n.t('errors.invitation', "Invitation Failed.  Please try again."));
      });
    });
    $(".date_entry").datetime_field({alwaysShowTime: true});

    $().data('current_default_wiki_editing_roles', $("#course_default_wiki_editing_roles").val());
    $("#course_default_wiki_editing_roles").change(function() {
      var $this = $(this);
      $(".changed_default_wiki_editing_roles").showIf($this.val() != $().data('current_default_wiki_editing_roles'));
      $(".default_wiki_editing_roles_change").text($this.find(":selected").text());
    });

    $(".re_send_invitations_link").click(function(event) {
      event.preventDefault();
      var $button = $(this),
          oldText = I18n.t('links.re_send_all', "Re-Send All Unaccepted Invitations");

      $button.text(I18n.t('buttons.re_sending_all', "Re-Sending Unaccepted Invitations...")).attr('disabled', true);
      $.ajaxJSON($button.attr('href'), 'POST', {}, function(data) {
        $button.text(I18n.t('buttons.re_sent_all', "Re-Sent All Unaccepted Invitations!")).attr('disabled', false);
        $(".user_list .user.pending").each(function() {
          var $user = $(this);
          $user.fillTemplateData({data: {invitation_sent_at: I18n.t('invitation_sent_now', "Just Now")}});
        });
        setTimeout(function() {
          $button.text(oldText);
        }, 2500);
      }, function() {
        $button.text(I18n.t('errors.re_send_all', "Send Failed, Please Try Again")).attr('disabled', false);
      });
    });
    $("#enrollment_type").change(function() {
      $(".teacherless_invite_message").showIf($(this).find(":selected").hasClass('teacherless_invite'));
    });

    $(".self_enrollment_checkbox").change(function() {
      $(".open_enrollment_holder").showIf($(this).attr('checked'));
    }).change();

    $("#publish_grades_link").click(function(event) {
      event.preventDefault();
      GradePublishing.publish();
    });
    if (ENV.PUBLISHING_ENABLED) {
      GradePublishing.checkup();
    }

    $(".reset_course_content_button").click(function(event) {
      event.preventDefault();
      $("#reset_course_content_dialog").dialog({
        title: I18n.t('titles.reset_course_content_dialog_help', "Reset Course Content"),
        width: 500
      });

      $(".ui-dialog").focus();
    }).fixDialogButtons();
    $("#reset_course_content_dialog .cancel_button").click(function() {
      $("#reset_course_content_dialog").dialog('close');
    });

    $("#course_custom_course_visibility").click(function(event) {
      $("#customize_course_visibility").toggle(this.checked);
    });

    $("#course_custom_course_visibility").ready(function(event) {
      if($("#course_custom_course_visibility").prop('checked')) {
        $("#customize_course_visibility").toggle(true);
      } else {
        $("#customize_course_visibility").toggle(false);
      }
    });

    $("#course_course_visibility").change(function(event) {
      var order = $(this).children();
      var selected = $(this).find(":selected");
      $.each($('#customize_course_visibility select'), function(i, sel){
        $(sel).children('option').remove();
        for(var i=$.inArray(selected[0], order), len=order.length; i < len; i++) {
          $(order[i]).clone().appendTo($(sel));
        }
      });
      $('#customize_course_visibility select').val($("#course_course_visibility").val())
    });

    $("#course_custom_course_visibility").ready(function(event) {
      var order = $("#course_course_visibility").children();
      var selected = $("#course_course_visibility").find(":selected");
      var current = $('#customize_course_visibility select').find(":selected");
      $.each($('#customize_course_visibility select'), function(i, sel){
        $(sel).children('option').remove();
        for(var i=$.inArray(selected[0], order), len=order.length; i < len; i++) {
          $(order[i]).clone().appendTo($(sel));
        }
      });
      $('#customize_course_visibility select').val($(current).val())
    });

    $("#course_show_announcements_on_home_page").change(function(event) {
      $("#course_home_page_announcement_limit").prop("disabled", !$(this).prop('checked'))
    });
  });
